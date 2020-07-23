const mongoose= require('mongoose');

const usersSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nom : String,
    prenom : String,
    description : String,
    lienprofil: String,
    email: String,
    pwd: String
});

module.exports = mongoose.model('users', usersSchema);