var mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
var Schema = mongoose.Schema;

var walletSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        index: true,
    },
    amount: {
        type: Number,
    },
    transaction_id: {
        type: String,
    },
    order_id: {
        type: String,
    },
    debit: {
        type: Boolean
    },
    credit: {
        type: Boolean
    },
    reason:{
        type:String
    },
    payment_status:{
        type: Number,   //1- compleeted , 0- failed
        default: 0
    },
    status: {
        type: Number,
        default: 1 //1->co, 0->inactive 
    },
}, {
    timestamps: true
});

walletSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('wallet', walletSchema);