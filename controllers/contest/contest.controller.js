const mongoose = require('mongoose');
const { body, sanitizeBody, validationResult } = require("express-validator");

/** Import Helpers and middlewares */
const apiResponse = require("../../helpers/apiResponse");
const { createpayment } = require("../../helpers/razorpay");
const { doUpload, getUpload, doDelete } = require('../../helpers/gridfs')
const { checkForAmount } = require('../../helpers/baseFunctions')

/** Import Models */
const Contest = require("../../models/contest.model");
const Wallet = require("../../models/wallet.model");


/** Create contest */
module.exports.createContest = [
    body("contest_title").isLength({ min: 1 }).withMessage("Contest title must be specified."),
    body("contest_description").isLength({ min: 1 }).withMessage("Contest description must be specified."),
    body("contest_type").isLength({ min: 1 }).withMessage("Contest type must be specified."),
    body("participation_details").isLength({ min: 1 }).withMessage("Participation details must be specified."),
    body("terms_and_condition").isLength({ min: 1 }).withMessage("Terms and conditions must be specified."),
    body("contest_startDate").isLength({ min: 1 }).withMessage("Start date must be specified."),
    body("contest_endDate").isLength({ min: 1 }).withMessage("End date must be specified."),
    body("submission_deadline").isLength({ min: 1 }).withMessage("Submission deadline must be specified."),
    body("result_date").isLength({ min: 1 }).withMessage("Result date must be specified."),
    body("max_participants").isLength({ min: 1 }).withMessage("Maximum participants must be specified."),
    body("entry_fee").isLength({ min: 1 }).withMessage("Entry fee must be specified."),
    body("total_winners").isLength({ min: 1 }).withMessage("Total winners must be specified."),
    body("distribution_pattern").isLength({ min: 1 }).withMessage("Distribution pattern must be specified."),
    body("tax").isLength({ min: 1 }).withMessage("Tax must be specified."),
    body("discount").isLength({ min: 1 }).withMessage("Discount must be specified."),
    body("total_amount").isLength({ min: 1 }).withMessage("Total amount must be specified."),

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        try {

            var { thumbnail_image, contest_title, contest_description, contest_type, participation_details, terms_and_condition, contest_startDate, contest_endDate, submission_deadline, result_date, max_participants, entry_fee, total_winners, distribution_pattern, tax, discount, total_amount } = req.body;
            distribution_pattern = JSON.parse(distribution_pattern)

            var balance = await checkForAmount(req.auth._id, total_amount)
            if (balance == false) {
                return apiResponse.ErrorResponse(res, 400, req.t("Insufficient balance"));
            }

            if (req.files && req.files.thumbnail_image) {
                thumbnail_image = await doUpload(req.files.thumbnail_image, 'thumbnail_image');
            }

            var insert_data = {
                created_by: req.auth._id,
                thumbnail_image,
                contest_title,
                contest_description,
                contest_type,
                participation_details,
                terms_and_condition,
                contest_startDate,
                contest_endDate,
                submission_deadline,
                result_date,
                max_participants,
                entry_fee,
                total_winners,
                distribution_pattern,
                tax,
                discount,
                total_amount
            }
            var wallet_data = {
                user_id: req.auth._id,
                amount: total_amount,
                debit: true,
                reason: 'CREATE CONTEST'
            }
            var contest = await Contest.create(insert_data);
            if (contest) {
                await Wallet.create(wallet_data)
                return apiResponse.successResponse(res, 200, req.t('Contest Created Successfully'));
            } else {
                return apiResponse.ErrorResponse(res, 409, req.t('Contest Not Created'));
            }


        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** Get all contest */
module.exports.getAllContest = [
    async (req, res) => {

        try {

            var aggregate = Contest.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by",
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    email: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        contest_name: 1,
                        contest_description: 1,
                        contest_type: 1,
                        participation_details: 1,
                        terms_and_condition: 1,
                        contest_startDate: 1,
                        contest_endDate: 1,
                        submission_deadline: 1,
                        result_date: 1,
                        max_participants: 1,
                        entry_fee: 1,
                        total_winners: 1,
                        distribution_pattern: 1,
                        tax: 1,
                        discount: 1,
                        total_amount: 1,
                        order_id: 1,
                        created_by: {$fisrt:'$created_by.name'},
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);

            var contests = await Contest.aggregatePaginate(aggregate, {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                sort: { updatedAt: -1 }
            });

            return apiResponse.successResponseWithData(res, 200, req.t('Contest List'), contests);
        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** Get contest by id */
module.exports.getContestById = [
    async (req, res) => {

        try {

            var { id } = req.params;

            var contest = await Contest.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id)
                    }
                }
            ])
            return apiResponse.successResponseWithData(res, 200, req.t('Contest Details'), contest);

        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** My contest */
module.exports.myContest = [
    async (req, res) => {

        try {

            var aggregate = Contest.aggregate([
                {
                    $match: {
                        created_by: mongoose.Types.ObjectId(req.auth._id)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "created_by",
                        foreignField: "_id",
                        as: "created_by",
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    email: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        contest_name: 1,
                        contest_description: 1,
                        contest_type: 1,
                        participation_details: 1,
                        terms_and_condition: 1,
                        contest_startDate: 1,
                        contest_endDate: 1,
                        submission_deadline: 1,
                        result_date: 1,
                        max_participants: 1,
                        entry_fee: 1,
                        total_winners: 1,
                        distribution_pattern: 1,
                        tax: 1,
                        discount: 1,
                        total_amount: 1,
                        order_id: 1,
                        created_by: '$created_by.name',
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ]);

            var contests = await Contest.aggregatePaginate(aggregate, {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                sort: { updatedAt: -1 }
            });

            return apiResponse.successResponseWithData(res, 200, req.t('My Contest List'), contests);
        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** Update contest */
module.exports.updateContest = [
    async (req, res) => {
        try {
            var contestId = mongoose.Types.ObjectId(req.params.id);

            var { thumbnail_image, contest_title, contest_description, contest_type, participation_details, terms_and_condition, contest_startDate, contest_endDate, submission_deadline, result_date, max_participants, entry_fee, total_winners, distribution_pattern, tax, discount, total_amount } = req.body;
            distribution_pattern = JSON.parse(distribution_pattern)

            var contestData = await Contest.findOne(contestId)
            if (!contestData) {
                return apiResponse.ErrorResponse(res, 404, req.t('CONTEST NOT FOUND'))
            }
            oldImage = contestData.thumbnail_image;
            if (req.files && req.files.thumbnail_image) {
                thumbnail_image = await doUpload(req.files.thumbnail_image, 'thumbnail_image');
                await doDelete(oldImage, req, res)
            }

            var update_data = {
                thumbnail_image,
                contest_title,
                contest_description,
                contest_type,
                participation_details,
                terms_and_condition,
                contest_startDate,
                contest_endDate,
                submission_deadline,
                result_date,
                max_participants,
                entry_fee,
                total_winners,
                distribution_pattern,
                tax,
                discount,
                total_amount
            }
            var contest = await Contest.findByIdAndUpdate(contestId, update_data, { new: true });
            return apiResponse.successResponse(res, 200, req.t('Contest Updated Successfully'));

        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

module.exports.getImage = [
    async (req, res) => {
        try {
            await getUpload(req.query.image, req, res)
        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('Internal Server Error'));
        }
    }
];
