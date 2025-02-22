const mongoose = require('mongoose');
const apiResponse = require('../helpers/apiResponse');

const Wallet = require('../models/wallet.model');

exports.checkForAmount = async (userId, amount)=> {
    var wallet = await Wallet.aggregate([
        {
            $match: {
                user_id: mongoose.Types.ObjectId(userId)
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
                total_credit: {$first: "$total_credit.total_credit_amount"},
                total_debit: {$first: "$total_debit.total_debit_amount"},
            }
        },
        {
            $addFields:{
                remaning_balence: {
                    $subtract: ["$total_credit", "$total_debit"]
                } 
            }
        }
    ])

    if(wallet.length<=0){
        return false
    }else if(wallet[0].remaning_balence < amount){
        return false
    }else{
        return true
    }

}

exports.addToWallet = async (userId, amount)=> {
    var wallet = Wallet.findOne({ userId: userId });

    if(!wallet){
        return false
    }else if(wallet.amount < amount){
        return false
    }else{
        return true
    }

}