var mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    role_id: {
        type: Number,
        enum: [1,2,3,99], /* 1-->User 99-->SUPERADMIN */
        default: 1,
    },
    role_type: {
        type: String,
        enum: ["USER"],
        default: "USER",
    },
    name:{
        type:String,
        required:true
    },
    phone_or_email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    status: {
        type: Number,
        default: 1 //1->active, 0->inactive 
    },
}, {
    timestamps: true
});

userSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('user', userSchema);