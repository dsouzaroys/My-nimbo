var mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
var Schema = mongoose.Schema;

var contestHistorySchema = new Schema({
    joined_contest_id: {
        type: Schema.ObjectId,
        index: true,
    },
    liked_by: {
        type: Schema.ObjectId,
        index: true,
    },
    shared_by: {
        type: Schema.ObjectId,
        index: true,
    },
    status: {
        type: Number,
        default: 1 //1->active, 0->inactive 
    },
}, {
    timestamps: true
});

contestHistorySchema.plugin(aggregatePaginate);
module.exports = mongoose.model('contest_history', contestHistorySchema);