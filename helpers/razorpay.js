var Razorpay = require("razorpay");
const crypto = require("crypto");

exports.createpayment = async function (amount) {
    try {

        let instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const orderParams = {
            currency: 'INR',
            amount: amount * 100,
            receipt: crypto.randomBytes(5).toString("hex"),
            payment_capture: 1, // Automatically capture payment after successful verification
        };

        const data = await instance.orders.create(orderParams).then(Orders => {
            return Orders;
        })

        return data;

    } catch (err) {
        return err;
    }
}

exports.getpayment = async function (orderid) {
    try {

        let instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const data = await instance.orders.fetchPayments(orderid)
        return data;

    } catch (err) {
        return err;
    }
}

exports.refund = async function (paymentid, refundOptions) {
    try {

        let instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const data = await instance.payments.refund(paymentid, refundOptions)
        return data;

    } catch (err) {
        return err;
    }
}