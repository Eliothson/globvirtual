const mongoose= require('mongoose');

const produitSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nomProduit : String,
    prix : String,
    description : String,
    chemin: String,
    userId: String
});

module.exports = mongoose.model('produit', produitSchema);