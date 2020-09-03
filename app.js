const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const date = require('date-and-time')
var ObjectId = require('mongodb').ObjectID;
const Users = require('./models/user')
const Produits = require('./models/produits')
const expressSession = require('express-session')

// const date=require('date-and-time')
app.use('/upload', express.static('upload'));
app.use('/modifier/upload', express.static(__dirname + '/upload'));
app.use('/singleproduct/upload', express.static(__dirname + '/upload'));
app.use('/professionelSingle/upload', express.static(__dirname + '/upload'));




app.use('/assets', express.static(__dirname + '/assets'));
app.use('/admin/assets', express.static(__dirname + '/assets'));
app.use('/singleproduct/assets', express.static(__dirname + '/assets'));
app.use('/professionelSingle/assets', express.static(__dirname + '/assets'));


app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json());
app.use(expressSession({
    secret: "mtsecretkey123",
    saveUninitialized: false,
    resave: false
}))
let datepost;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/');
    },
    filename: function (req, file, cb) {
        datepost = date.format(new Date(), 'YY-MM-DD HH-mm-ss SSS');
        cb(null, datepost + file.originalname);
    }
});
const upload = multer({
    storage: storage
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Origin",
        "Origin, X-Requested-With, Content-Type, Accept, Authorizatio"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE,PATH,GET ');
        return res.status(200).json({});
    }
    next();
});
mongoose.connect('mongodb+srv://admin:1234@globvirtual.fzrhv.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (error) => {
    if (error) console.log(error);
})

//urls de base
app.get('/', (req, response) => {
    if (req.session.user) {
        response.render('client/index', {
            user: req.session.user
        })
    } else {
        response.render('client/index')
    }
});
app.get('/index', (req, response) => {
    if (req.session.user) {
        response.render('client/index', {
            user: req.session.user
        })
    } else {
        response.render('client/index')
    }
});

app.get('/market', (req, response) => {
    Produits.find()
    .select('nomProduit prix description chemin id')
    .exec()
    .then(docs => {
        response.render('client/market', {
            produit: docs,
            user: req.session.user
        })
    })
    .catch(err => {
        console.log(err)
    });
});

app.get('/professionels', (req, response) => {
    Users.find()
        .select('nom email pwd chemin prof')
        .exec()
        .then(docs => {
            response.render('client/professionels', {
                professionels: docs,
                user: req.session.user
            })
        })
        .catch(err => {
            console.log(err)
        });

});
app.get('/contact', (req, response) => {
    if (req.session.user) {
        response.render('client/contact', {
            user: req.session.user
        })
    } else {
        response.render('client/contact')
    }
});

//fonctionalites des utilisateurs
app.get('/conn', (req, response) => {
    if (req.session.user) {
        response.render('client/dashboard', {
            user: req.session.user
        })
    } else {
        response.render('client/conn')
    }
});
app.post('/conn', (req, res) => {
    if(req.session.user){
        res.redirect("/userdashboard")
    }else{
        Users.find()
        .select('nom email pwd chemin')
        .exec()
        .then(docs => {
            for (i = 0; i < docs.length; i++) {
                if (docs[i].email == req.body.mail && docs[i].pwd == req.body.pwd) {
                    req.session.user = docs[i]
                    break;
                }
            }
        })
        .then(() => {
            if (req.session.user) {
                res.redirect('/userdashboard')
            } else(
                res.redirect('/conn')
            )
        })
        .catch(err => {
            console.log(err)
        }); 
    }
    
})
app.get('/deconection', (req, response) => {
    if (req.session.user) {
        req.session.user = null
        response.redirect('/')
    }
});
app.get('/inscription', (req, response) => {
    if (req.session.user) {
        response.render('client/dashboard', {
            user: req.session.user
        })
    } else {
        response.render('client/inscription')
    }
});
app.post('/inscription', upload.single("postmedia"), (req, res) => {
    let test=true
    Users.find()
    .select('email')
    .exec()
    .then(docs => {
        for (i = 0; i < docs.length; i++) {
            if (docs[i].email == req.body.mail) {
                test=false
                break;
            }
        }
    })
    .then(() => {
        if(test){
            if (req.session.user) {
            res.redirect('/userdashboard')
            } else{
                const user = new Users({
                    _id: new mongoose.Types.ObjectId,
                    nom: req.body.nom,
                    email: req.body.mail,
                    tel: req.body.tel,
                    prof: req.body.prof,
                    pwd: req.body.pwd,
                    chemin: req.file.path
                });
                user.save()
                .then(() => {
                    res.redirect('/conn')
                })
                .catch(err => {
                    res.send(err);
                });
            }
        }else{
            const fss = require('fs');
            try {
                fss.unlinkSync(req.file.path);
            } catch (err) {
                console.log(err)
            }
            res.render('client/inscription',{ info:"Quelqu'un a deja utilise ce Mail"})
        }
    })
    .catch(err => {
        console.log(err)
    });
})
app.get('/userdashboard', (req, res) => {
    if (req.session.user) {
        Produits.find({ userId: req.session.user._id})
        .select('nomProduit prix description chemin id')
        .exec()
        .then(docs => {
            res.render('client/userdashboard', {
                produits: docs,
                user: req.session.user
            })
        })
        .catch(err => {
        });
    } else {
        res.redirect('/')
    }
})
app.get('/professionelSingle/:id', (req, res) => {
    Users.findById({
            _id: ObjectId(req.params.id)
        })
        .select()
        .exec()
        .then(docs => {
            res.render('client/professionelSingle', {
                singleUser: docs,
                user: req.session.user
            })
        })
        .catch(err => {
            console.log(err)
        });
})
app.get('/ajouterProduit', (req, res) => {
    if (req.session.user) {
        res.render('client/ajouterProduit', {
            user: req.session.user
        })
    } else {
        res.render('client/ajouterProduit')
    }
})

app.post('/ajouterProduit',upload.single("postmedia"),(req,res)=>{
    const produits = new Produits({
        _id : new mongoose.Types.ObjectId,
        nomProduit : req.body.nomProduit,
        prix: req.body.prix,
        description: req.body.description,
        chemin:req.file.path,
        userId: req.session.user._id
    });
    produits.save()
    .then( ()=>{
        res.redirect('/userdashboard')
    })
    .catch(err=>{
        res.send(err);
    });
})



//fonctionalites des produits
app.get('/singleproduct/:id', (req, response) => {
    Produits.findById({
            _id: ObjectId(req.params.id)
        })
        .select()
        .exec()
        .then(docs => {
            Users.findById({
                    _id: ObjectId(docs.userId)
                })
                .select("tel email")
                .exec()
                .then(doc => {
                    response.render('client/singleproduct', {
                        prod: docs,
                        infomarchant: doc,
                        user: req.session.user
                    })
                })
                .catch(err => {
                    console.log(err);
                    response.status(500);
                })
        })
        .catch(err => {
            console.log(err);
            response.status(500);
        });
});
app.get('/singleUser', (req, res) => {});




//-------------------------------- admin part -------------------------

app.get('/admin', (req, res) => {
    res.render('client/admin', {
        user: req.session.user
    })
})
app.post('/admin', (req, res) => {
    if (req.body.pseudo == "administrator" && req.body.pwd == "admin2020") {
        req.session.admin = 1
        res.render('client/administrator', {
            user1: req.session.admin
        })
    } else(
        res.redirect('/')
    )
})

app.get('/useradmin', (req, res) => {
    Users.find()
        .select('nom tel email')
        .exec()
        .then(docs => {
            docs.reverse()
            req.session.admin = 1
            res.render('client/useradmin', {
                user1: req.session.admin,
                users: docs
            })
        })
        .catch(err => {
            console.log(err)
        });
})
app.get('/produitadmin', (req, res) => {
    Produits.find()
        .select('_id nomProduit prix')
        .exec()
        .then(docs => {
            docs.reverse()
            req.session.admin = 1
            res.render('client/produitadmin', {
                user1: req.session.admin,
                produits: docs
            })
        })
        .catch(err => {
            console.log(err)
        });
})
app.get('/deleteProduit/:idproduit', (req, res) => {
    Produits.findById({_id :ObjectId(req.params.idproduit)})
    .then((docs)=>{
        Produits.findByIdAndDelete(req.params.idproduit)
        .then(()=>{
            const fss = require('fs');
            try {
                fss.unlinkSync(docs.chemin);
            } catch (err) {
                console.log(err)
            }
        })
        .then(() => {
            if(req.session.user){
                res.redirect('/userdashboard')
            }else{
                res.redirect('/produitadmin')
            }
            
        })
        .catch(error => {
            console.log(error);
        })
    })
    .catch(error=>{
        console.log(error);
    })
})



app.get('/deleteUsers/:idusers', (req, res) => {
    Users.findById({_id :ObjectId(req.params.idusers)})
    .then((docs)=>{
        Users.findByIdAndDelete(req.params.idusers)
        .then(()=>{
            const fss = require('fs');
            try {
                fss.unlinkSync(docs.chemin);
            } catch (err) {
            }
        })
        .then(() => {
            res.redirect('/useradmin')
        })
        .catch(error => {
            console.log(error);
        })
    })
    .catch(error=>{
        console.log(error);
    })   
})

app.get('/modifierUti/:id', (req, res) => {
    var id = req.params.id
    Users.findById({
            _id: ObjectId(id)
        })
        .select('_id nom prenom dateNaissance telephone email pwd')
        .exec()
        .then(docs => {
            res.render('admin/listutilisateur', {
                user: docs
            })
        })
        .catch(err => {
            console.log(err);
            response.status(500);
        });


})

//gestion des erreus dans les urls
app.use((req, res, next) => {
    // const error = new Error('Page Non trouvee');
    // error.status = 404;
    // next(error);
    res.redirect('/')
});

app.use((error, req, res, next) => {
    // res.status(error.status || 500);
    // res.json({
    //     error: {
    //         message: error.message
    //     }
    // });
    res.redirect('/')
});

function removeExtraSpace(str) {
    str = str.replace(/[\s]{2,}/g, " "); // Enlève les espaces doubles, triples, etc.
    str = str.replace(/^[\s]/, ""); // Enlève les espaces au début
    str = str.replace(/[\s]$/, ""); // Enlève les espaces à la fin
    return str;
}

module.exports = app;