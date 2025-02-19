var mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
var Schema = mongoose.Schema;

var contestSchema = new Schema({
    created_by:{
        type: Schema.ObjectId,
    },
    thumbnail_image: {
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
    participation_details: {
        type: String,
    },
    terms_and_condition: {
        type: String,
    },
    contest_startDate: {
        type: Date,
    },
    contest_endDate: {
        type: Date,
    },
    submission_deadline: {
        type: Date,
    },
    result_date: {
        type: Date,
    },
    max_participants: {
        type: Number,
    },
    entry_fee: {
        type: Number,
    },
    total_winners: {
        type: Number,
    },
    distribution_pattern: [
        {
            rank: {
                type: String,
            },
            prize_amount: {
                type: String,
            }
        }
    ],
    tax:{
        type: String,
    },
    discount: {
        type: String,
    },
    total_amount:{
        type: Number,
    },
    order_id: {
        type: String,
    },
    paid_status:{
        type: Number,
        default: 0  //0->unpaid, 1->paid
    },
    status: {
        type: Number,
        default: 1 //1->active, 0->inactive 
    },
}, {
    timestamps: true
});

contestSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('contest', contestSchema);