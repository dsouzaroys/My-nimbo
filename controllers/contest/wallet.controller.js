const mongoose = require('mongoose');
const { body, sanitizeBody, validationResult } = require("express-validator");

/** Import Helpers and middlewares */
const apiResponse = require("../../helpers/apiResponse");
const { createpayment } = require("../../helpers/razorpay")

/** Import Models */
const Wallet = require("../../models/wallet.model");

/** Join contest */
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

/** List joined contest  */
module.exports.list = [
    async (req, res) => {

        try {

            console.log(req.auth._id)
            var aggregate = Wallet.aggregate([
                {
                    $match: {
                        user_id: mongoose.Types.ObjectId(req.auth._id),
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




