const mongoose = require('mongoose');
const apiResponse = require("../helpers/apiResponse");

module.exports.checkSuperAdmin = async (req, res, next) => {
    await Adminuser.findById(req.auth._id).then(result => {
        if(result.role_id == 99) {
            next();
        } else {
            return apiResponse.ErrorResponse(res, 403, "Access denied");
        }
    }).catch(err => {
        console.log(err);
        return apiResponse.ErrorResponse(res, 403, "Access denied");
    });
}