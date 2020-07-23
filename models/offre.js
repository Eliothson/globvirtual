const mongoose= require('mongoose');

const offresSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    titre : String,
    description : String,
    budget:String,
    userId: String
});

module.exports = mongoose.model('offres', offresSchema);