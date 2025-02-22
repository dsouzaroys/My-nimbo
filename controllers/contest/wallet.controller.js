const mongoose = require('mongoose');
const { body, sanitizeBody, validationResult } = require("express-validator");

/** Import Helpers and middlewares */
const apiResponse = require("../../helpers/apiResponse");
const { createpayment } = require("../../helpers/razorpay")

/** Import Models */
const Wallet = require("../../models/wallet.model");

/** add amount */
module.exports.addAmont = [
    body("amount").isLength({ min: 1 }).trim().withMessage("Contest id must be specified."),
    body("transaction_id").isLength({ min: 1 }).trim().withMessage("Contest image must be specified."),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        try {

            var { amount, transaction_id, credit_from, credit, reason } = req.body;

            var insert_data = {
                user_id: req.auth._id,
                amount,
                transaction_id,
                credit: true,
                reason: 'TOP-UP'
            }

            const paymentData = await createpayment(amount);
            const orderID = paymentData.id;

            insert_data.order_id = orderID;
            var wallet = await Wallet.create(insert_data);
            const result = {
                orderId: orderID,
                bookingId: wallet._id,
                RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
                totalPrice: amount,
            }
            console.log(result)

            if (wallet) {
                return apiResponse.successResponseWithData(res, 200, req.t('Amount to wallet added Successfully', result));
            } else {
                return apiResponse.ErrorResponse(res, 409, req.t('Unable to add amount'));
            }


        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** List   */
module.exports.list = [
    async (req, res) => {

        try {

            var search_match = {};
            if (req.query.deposit && String(req.query.deposit) == '1') {
                search_match.$or = [
                    { 'credit': true, payment_status:1 }
                ];
            }
            else if (req.query.failed && String(req.query.failed) == '1') {
                search_match.$or = [
                    { 'credit': true, payment_status:0 }
                ];
            }
            var aggregate = Wallet.aggregate([
                {
                    $match: {
                        user_id: mongoose.Types.ObjectId(req.auth._id),
                        $and: [
                            search_match
                        ]
                    }
                },
            ])
            const result = await Wallet.aggregatePaginate(aggregate, {
                page: req.query.page ? req.query.page : 1,
                limit: 10,
                sort: { updatedAt: -1 },
            });
            return apiResponse.successResponseWithData(res, 200, req.t('Wallet Data'), result);



        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** wallet balencce */
module.exports.balance = [
    async (req, res) => {

        try {

            var balance = await Wallet.aggregate([
                {
                    $match: {
                        user_id: mongoose.Types.ObjectId(req.auth._id)
                    }
                },
                {
                    $facet: {
                        total_credit: [
                            {
                                $match: { credit: true, payment_status: 1 }
                            },
                            {
                                $group: {
                                    _id: null,  // Group all matched documents together
                                    total_credit_amount: { $sum: "$amount" }
                                }
                            }
                        ],
                        total_debit: [
                            {
                                $match: { debit: true, payment_status: 1 }
                            },
                            {
                                $group: {
                                    _id: null,
                                    total_debit_amount: { $sum: "$amount" }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        total_credit: {
                            $ifNull: [{ $arrayElemAt: ["$total_credit.total_credit_amount", 0] }, 0]
                        },
                        total_debit: {
                            $ifNull: [{ $arrayElemAt: ["$total_debit.total_debit_amount", 0] }, 0]
                        }
                    }
                },
                {
                    $addFields: {
                        remaning_balence: {
                            $subtract: ["$total_credit", "$total_debit"]
                        }
                    }
                }
            ])
            return apiResponse.successResponseWithData(res, 200, req.t('Balance'), balance);

        } catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res, 500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]




