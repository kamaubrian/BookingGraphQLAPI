const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{type:String,required:true},
    description:{type:String,required:true},
    price:{type:Number,required:true},
    date:{type:Date,required:true}
});

module.exports = mongoose.model('Event',eventSchema);