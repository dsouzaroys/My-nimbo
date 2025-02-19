var mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
var Schema = mongoose.Schema;

var joinedContestSchema = new Schema({
    joined_by: {
        type: Schema.ObjectId,
        index: true,
    },
    contest_id: {
        type: Schema.ObjectId,
        index: true,
    },
    contest_image: {
        type: String,
    },
    contest_title: {
        type: String,
    },
    contest_description: {
        type: String,
    },
    contest_type: {
        type: String,
    },
    joined_Date: {
        type: Date,
    },
    entry_fee: {
        type: Number,
    },
    tax:{
        type: String,
    },
    discount: {
        type: String,
    },
    total_amount:{
        type: Number,
    },
    paid_status:{
        type: Number,
        default: 0  //0->unpaid, 1->paid
    },
    contest_likes: {
        type: Number,
        default: 0,
    },
    contest_share: {
        type: Number,
        default: 0,
    },
    status: {
        type: Number,
        default: 1 //1->active, 0->inactive 
    },
}, {
    timestamps: true
});

joinedContestSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('joined_contest', joinedContestSchema);