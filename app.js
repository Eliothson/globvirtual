const express= require('express');
const app= express();
const bodyparser=require('body-parser');
const multer= require('multer');
const mongoose= require('mongoose')
const nodemailer= require('nodemailer')
const date= require('date-and-time')
var ObjectId = require('mongodb').ObjectID;
const Users= require('./models/user')
const Offres= require('./models/offre')





const expressSession= require('express-session')

// const date=require('date-and-time')


app.use('/upload', express.static('upload'));
app.use('/modifier/upload', express.static(__dirname + '/upload'));

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/visionkat/assets', express.static(__dirname + '/assets'));
app.use('/admin/assets', express.static(__dirname + '/assets'));

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(expressSession({ secret: "mtsecretkey123", saveUninitialized: false, resave:false}))
// let datepost;
// const storage = multer.diskStorage({
//         destination : function(req, file, cb){
//             cb(null, './upload/');
//         },
//         filename: function (req, file, cb){
//             datepost = date.format(new Date(), 'YY-MM-DD HH-mm-ss SSS');
//            cb(null, datepost+file.originalname);
//         }
// });
// const upload = multer({storage: storage});


app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
    "Access-Control-Allow-Origin",
    "Origin, X-Requested-With, Content-Type, Accept, Authorizatio"
    );
    if (req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE,PATH,GET ');
        return res.status(200).json({});
    }
    next(); 
});


mongoose.connect('mongodb+srv://admin:admin1234@appmusic.mrlsy.mongodb.net/<dbname>?retryWrites=true&w=majority',
{useNewUrlParser : true, useUnifiedTopology: true  }, (error)=>{
 //console.log(error);
})
//mongoose.connect("mongodb://localhost:27017/JwenPyesDatabase", {useNewUrlParser : true, useUnifiedTopology: true});


app.get('/',(req,response)=>{
    if (req.session.user){
        response.render('client/index', {user : req.session.user})
    }else {
      response.render('client/index')
    }
});

app.get('/index',(req,response)=>{
    if (req.session.user){
        response.render('client/index', {user : req.session.user})
    }else {
      response.render('client/index')
    }});

app.get('/inscription',(req,response)=>{
    if(req.session.user){
        response.render('client/dashboard', {user : req.session.user})
    }else{
        response.render('client/inscription')
    }
});

app.get('/connection',(req,response)=>{
    if(req.session.user){
        response.render('client/dashboard', {user : req.session.user})
    }else{
        response.render('client/connection')
    }

});
app.get('/dashboard',(req,response)=>{
    var useroffre=[]
    if (req.session.user){
        Offres.find()
        .select()
        .exec()
        .then( docs=>{
            for (i=0; i< docs.length; i++){
                if(docs[i].userId==req.session.user._id){
                    useroffre[useroffre.length+1]=docs[i]
                } 
            }
        })
        .then(()=>{
            response.render('client/dashboard',{user:req.session.user, useroffre:useroffre})
        })
        .catch( err=>{
            console.log(err)
        });

    }else{
        response.render('client/connection')
    }
});

app.get('/offres',(req,response)=>{
    Offres.find()
    .select()
    .exec()
    .then((docs)=>{
        if(req.session.user){
            response.render('client/offres',{user:req.session.user, useroffre:docs.reverse()})
        }else{
            response.render('client/offres',{useroffre:docs.reverse()})
        }
    })
    .catch( err=>{
        console.log(err)
    });
});

app.get('/contact',(req,response)=>{
    if(req.session.user){
        response.render('client/contact',{user:req.session.user})
    }else{
        response.render('client/contact')
    }
});

app.get('/help',(req,response)=>{
    if(req.session.user){
        response.render('client/help',{user:req.session.user})
    }else{
        response.render('client/help')
    }
});

app.get('/artiste',(req,response)=>{
    if(req.session.user){
        response.render('client/artiste',{user:req.session.user})
    }else{
        response.render('client/artiste')
    }
});

app.get('/detailproduit',(req,response)=>{
    if(req.session.user){
        response.render('client/detailproduit',{user:req.session.user})
    }else{
        response.render('client/detailproduit')
    }
});

app.get('/ajout',(req,response)=>{

    if(req.session.user){
        if(req.query.var=="projet"){
            response.render('client/ajout',{user:req.session.user, ajouttype:"projet"})
        }else if(req.query.var=="offre"){
            response.render('client/ajout',{user:req.session.user, ajouttype:"offre"})
        } else if (req.query.var=="son"){
            response.render('client/ajout',{user:req.session.user, ajouttype:"son"})
        }else{
            response.render('client/ajout',{user:req.session.user, ajouttype:"track"})
        }
    }else{
        response.render('client/connection')
    }
});

app.post('/ajout',(req,res)=>{
    if(req.body.type=="offre"){
        const offre = new Offres({
            _id : new mongoose.Types.ObjectId,
            titre : req.body.titreoffre,
            description: req.body.description,
            budget: req.body.budget,
            userId: req.session.user._id
        });
        offre.save()
        .then(()=>{
            res.redirect('/dashboard')
        })
        .catch(err=>{
            res.send(err);
        });

    }else if(req.body.type=="son"){
        const offre = new Offres({
            _id : new mongoose.Types.ObjectId,
            titre : req.body.titreoffre,
            description: req.body.description,
            budget: req.body.budget,
            userId: req.session.user._id
        });
        offre.save()
        .then(()=>{
            res.redirect('/dashboard')
        })
        .catch(err=>{
            res.send(err);
        });

    }else if(req.body.type=="track"){
        const offre = new Offres({
            _id : new mongoose.Types.ObjectId,
            titre : req.body.titreoffre,
            description: req.body.description,
            budget: req.body.budget,
            userId: req.session.user._id
        });
        offre.save()
        .then(()=>{
            res.redirect('/dashboard')
        })
        .catch(err=>{
            res.send(err);
        });

    }else{

        const offre = new Offres({
            _id : new mongoose.Types.ObjectId,
            titre : req.body.titreoffre,
            description: req.body.description,
            budget: req.body.budget,
            userId: req.session.user._id
        });
        offre.save()
        .then(()=>{
            res.redirect('/dashboard')
        })
        .catch(err=>{
            res.send(err);
        });
    }
    

    
});

app.get('/market',(req,response)=>{
    if(req.session.user){
        response.render('client/market',{user:req.session.user})
    }else{
        response.render('client/market')
    }
});
app.get('/workingpage',(req,response)=>{
    if(req.session.user){
        response.render('client/workingpage',{user:req.session.user})
    }else{
        response.render('client/workingpage')
    }
});





app.post('/connection', (req,res)=>{
    var test=undefined
    Users.find()
    .select()
    .exec()
    .then( docs=>{
        for (i=0; i< docs.length; i++){
            if(docs[i].email==req.body.email && docs[i].pwd==req.body.pwd){
                req.session.user=docs[i]
                break;
            } 
        }
    })
    .then(()=>{
        if(req.session.user){
            res.redirect('client/dashboard')
        }else{
            
        }
    })
    .catch( err=>{
        console.log(err)
    });
    

    

})
app.get('/deconnection',(req,response)=>{
    if (req.session.user){
        req.session.user=null
        response.redirect('/')
    }else{
        response.redirect('/')

    }
});

app.post('/inscription',(req,res)=>{
    const user = new Users({
        _id : new mongoose.Types.ObjectId,
        nom : req.body.name,
        prenom : req.body.prenom,
        description: req.body.description,
        lienprofil: "",
        email: req.body.email,
        pwd: req.body.pwd
    });
    user.save()
    .then(()=>{
        res.redirect('/connection')
        res.end()
    })
    .catch(err=>{
        res.send(err);
    });
})



//-------------------------------- admin part -------------------------

app.get('/admin', (req,res)=>{
    Users.countDocuments({}, (err,user)=>{
        Kat.countDocuments({}, (err,kat)=>{
            Lotpyess.countDocuments({}, (err,lotpyes)=>{
                Fich.countDocuments({}, (err,fich)=>{
                    Entreprise.countDocuments({},(err,entreprise)=>{
                        res.render('admin/dashboard',{
                        user:user,
                        kat:kat,
                        lotpyes: lotpyes,
                        fich:fich,
                        entreprise:entreprise
                        })
                    })
                })
            })
        })
    })
    
})

app.get('/listutilisateur',(req,res)=>{
    Users.find()
    .select(' _id nom prenom telephone email ')
    .exec()
    .then( docs=>{
        res.render('admin/listutilisateur',{user:docs})
    })
    
})
app.get('/modifierUti/:id',(req,res)=>{
  
    var id= req.params.id

    Users.findById({_id :ObjectId(id)})
    .select('_id nom prenom dateNaissance telephone email pwd')
    .exec()
    .then( docs=>{
        res.render('admin/listutilisateur', {user:docs })
    })
    .catch( err=>{
        console.log(err);
        response.status(500);
    });


})
app.get('/supprimer/:id', (req, response)=>{
    Users.findByIdAndDelete(req.params.id)
    .then( ()=>{
        response.redirect('/listutilisateur')
    })
    .catch(error=>{
        console.log(error);
    })
})

app.get('/efasepyes/:id', (req,res)=>{
    Pyesclient.findByIdAndDelete(req.params.id)
    .then( ()=>{
        res.redirect('/utilizate')
    })
    .catch(error=>{
        console.log(error);
    })
})


//gestion des erreus dans les urls
app.use((req, res, next)=>{
    const error = new Error('Page Non trouvee');
     error.status=404;
     next(error);
    //res.redirect('/')
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});

function removeExtraSpace(str)
{
    str = str.replace(/[\s]{2,}/g," "); // Enlève les espaces doubles, triples, etc.
    str = str.replace(/^[\s]/, ""); // Enlève les espaces au début
    str = str.replace(/[\s]$/,""); // Enlève les espaces à la fin
    return str;    
}

module.exports=app;
