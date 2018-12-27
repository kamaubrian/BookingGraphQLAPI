const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{type:String,required:true},
    password:{type:String,required:true},
    createdEvents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Event'
        }
    ]
},{timestamps:true});

module.exports = mongoose.model('User', userSchema);