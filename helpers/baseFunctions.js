const mongoose = require('mongoose');
const apiResponse = require('../helpers/apiResponse');

const Wallet = require('../models/wallet.model');

exports.checkForAmount = async (userId, amount)=> {
    var wallet = Wallet.findOne({ userId: userId });

    if(!wallet){
        return false
    }else if(wallet.amount < amount){
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