const mongoose= require('mongoose');

const usersSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nom : String,
    email: String,
    tel: String,
    prof: String,
    pwd: String,
    chemin: String
});

module.exports = mongoose.model('users', usersSchema);