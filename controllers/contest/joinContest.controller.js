const mongoose = require('mongoose');
const { body, sanitizeBody, validationResult } = require("express-validator");

/** Import Helpers and middlewares */
const apiResponse = require("../../helpers/apiResponse");
const { checkForAmount } = require('../../helpers/baseFunctions')

/** Import Models */
const JoinedContest = require("../../models/joinedContest.model");
const Contest = require("../../models/contest.model");
const ContestHistory = require("../../models/contestHistory.model");
const Wallet = require("../../models/wallet.model");


/** Join contest */
module.exports.joinContest = [
    body("contest_id").isLength({ min: 1 }).trim().withMessage("Contest id must be specified."),
    body("contest_title").isLength({ min: 1 }).trim().withMessage("Contest title must be specified."),
    body("contest_description").isLength({ min: 1 }).trim().withMessage("Contest description must be specified."),
    body("contest_type").isLength({ min: 1 }).withMessage("Contest type must be specified."),
    body("joined_Date").isLength({ min: 1 }).withMessage("Joined Date must be specified."),
    body("entry_fee").isLength({ min: 1 }).withMessage("Entry fee must be specified."),
    body("tax").isLength({ min: 1 }).withMessage("tax must be specified."),
    body("discount").isLength({ min: 1 }).withMessage("discount must be specified."),
    body("total_amount").isLength({ min: 1 }).withMessage("total_amount must be specified."),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        try {

            var { contest_id, contest_image, contest_title, contest_description, contest_type, joined_Date, entry_fee, tax, discount, total_amount } = req.body;

            var balance = await checkForAmount(req.auth._id, total_amount)
            if (balance == false) {
                return apiResponse.ErrorResponse(res, 400, req.t("Insufficient balance"));
            }

            today = new Date();
            var contestData = await Contest.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(contest_id),
                        submission_deadline: { $gte: today }
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                }
            ])
            if (contestData.length == 0) {
                return apiResponse.ErrorResponse(res, 409, req.t('Contest does not exist or submission deadline is over'));
            }

            var joinedContestData = await JoinedContest.findOne({ contest_id: contest_id, joined_by: req.auth._id });

            if (joinedContestData) {
                return apiResponse.ErrorResponse(res, 409, req.t('You have already joined this contest'));
            }

            var insert_data = {
                joined_by: req.auth._id,
                contest_id,
                contest_image,
                contest_title,
                contest_description,
                contest_type,
                joined_Date,
                entry_fee,
                tax,
                discount,
                total_amount,
            }
            var wallet_data = {
                user_id: req.auth._id,
                amount: total_amount,
                debit: true,
                payment_status: 1,
                reason: 'JOIN CONTEST'
            }
            var joinecdContest = await JoinedContest.create(insert_data);

            if (joinecdContest) {
                await Wallet.create(wallet_data)
                return apiResponse.successResponse(res, 200, req.t('Contest joined Successfully'));
            } else {
                return apiResponse.ErrorResponse(res, 409, req.t('Contest Not Created'));
            }


        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** List joined contest  */
module.exports.listJoinedContest = [
    async (req, res) => {

        try {

            var aggregate = JoinedContest.aggregate([
                {
                    $match: {
                        joined_by: mongoose.Types.ObjectId(req.auth._id),
                    }
                },
                {
                    $lookup: {
                        from: 'contests',
                        localField: 'contest_id',
                        foreignField: '_id',
                        pipeline: [],
                        as: 'contestData'
                    }
                },
                {
                    $unwind: '$contestData'
                },
                {
                    $project: {
                        contest_id: 1,
                        contest_image: 1,
                        contest_title: 1,
                        contest_description: 1,
                        contest_type: 1,
                        joined_Date: 1,
                        entry_fee: 1,
                        tax: 1,
                        discount: 1,
                        total_amount: 1,
                        created_by: '$contestData.created_by',
                        thumbnail_image: '$contestData.thumbnail_image',
                        contest_title: '$contestData.contest_title',
                        contest_description: '$contestData.contest_description',
                        contest_type: '$contestData.contest_type',
                        participation_details: '$contestData.participation_details',
                        terms_and_condition: '$contestData.terms_and_condition',
                        contest_startDate: '$contestData.contest_startDate',
                        contest_endDate: '$contestData.contest_endDate',
                        submission_deadline: '$contestData.submission_deadline',
                        result_date: '$contestData.result_date',
                        max_participants: '$contestData.max_participants',
                    }
                }
            ])
            var contests = await JoinedContest.aggregatePaginate(aggregate, {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                sort: { joined_Date: -1 }
            });
                return apiResponse.successResponseWithData(res, 200, req.t('Joined contest'), contests)

        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** Like and unlike */
module.exports.likeAndShare = async (req, res) => {
    try {
        var { joined_contest_id, contest_likes, contest_share } = req.body;
        let userId = mongoose.Types.ObjectId(req.auth._id);
        let contestId = mongoose.Types.ObjectId(joined_contest_id);

        if (contest_likes) {
            let existingLike = await ContestHistory.findOne({ joined_contest_id: contestId, liked_by: userId });
            if (existingLike) {
                await JoinedContest.updateOne({ _id: contestId }, { $inc: { contest_likes: -1 } });
                await ContestHistory.deleteOne({ _id: existingLike._id });
            } else {
                await JoinedContest.updateOne({ _id: contestId }, { $inc: { contest_likes: 1 } });
                await ContestHistory.create({ joined_contest_id: contestId, liked_by: userId });
            }
        }

        if (contest_share) {
            let existingShare = await ContestHistory.findOne({ joined_contest_id: contestId, shared_by: userId });
            if (existingShare) {
                await JoinedContest.updateOne({ _id: contestId }, { $inc: { contest_share: -1 } });
                await ContestHistory.deleteOne({ _id: existingShare._id });
            } else {
                await JoinedContest.updateOne({ _id: contestId }, { $inc: { contest_share: 1 } });
                await ContestHistory.create({ joined_contest_id: contestId, shared_by: userId });
            }
        }

        return apiResponse.successResponse(res, 200, req.t('Action performed successfully'));
    } catch (err) {
        console.error(err);
        return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
    }
};




