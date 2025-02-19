const mongoose= require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { body, sanitizeBody, validationResult } = require("express-validator");

/** Import Helpers and middlewares */
const apiResponse = require("../../helpers/apiResponse");

/** Import Models */
const User = require("../../models/user.model");

/** User Registration */
module.exports.register = [

    body("name").isLength({
        min: 1
    }).trim().withMessage("Name must be specified."),
    body("phone_or_email").isLength({
        min: 1
    }).trim().withMessage("Phone or email must be specified."),
    body("password").isLength({
        min: 1
    }).trim().withMessage("Password must be specified."),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        try{
            var { name, phone_or_email, password } = req.body;

            //check if user exists
            var user_exist = await User.aggregate([
                {
                    $match:{
                        phone_or_email: phone_or_email,
                    },
                },
                {$limit:1}
            ])

            if(user_exist.length <= 0) {
                return apiResponse.ErrorResponse(res,403, req.t('User Already Exist'));
            }
            
            bcrypt.hash(password, 10, async function (err, hash) {
                
                var insert_data = {
                    role_id: 1,
                    name,
                    phone_or_email,
                    password: hash
                }

                var inserted = await User.create(insert_data);
                if(inserted) {
                    return apiResponse.successResponse(res, 200,  req.t('User Created Successfully'));
                } else {
                    return apiResponse.ErrorResponse(res,409, req.t('User Not Created'));
                }

            });

        }catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res,500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]

/** User Login */
module.exports.login = [

    body("phone_or_email").isLength({
        min: 1
    }).trim().withMessage("Phone or email must be specified."),
    body("password").isLength({
        min: 1
    }).trim().withMessage("Password must be specified."),
    async (req,res)=>{
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res,422, "Validation error.", errors.array());
        }
        try{

            var { phone_or_email,password } = req.body;

            //check if user exists
            var user_exist = await User.aggregate([
                {
                    $match:{
                        status: 1,
                        phone_or_email: phone_or_email,
                        role_id: Number(1) 
                    },
                },
                {$limit:1}
            ])

            if(user_exist.length <= 0) {
                return apiResponse.ErrorResponse(res,403, req.t('Invalid credentials'));
            }
            user_exist = user_exist[0];

            const verified = bcrypt.compareSync(password, user_exist.password);
            if(!verified) {
                return apiResponse.ErrorResponse(res,403, req.t('Invalid credentials'));
            }

            let user_data =
                {
                    _id:user_exist._id,
                    phone_or_email: user_exist.phone_or_email,
                    role_id: user_exist.role_id,
                    name:user_exist.name,
                };

            //Prepare JWT token for authentication
            const jwtPayload = user_data;
            const jwtData = {
                expiresIn: process.env.JWT_TIMEOUT_DURATION,
            };
            const secret = process.env.JWT_SECRET;
            //Generated JWT token with Payload and secret.
            var userData = {};
            userData.token_type = "Bearer";
            userData.expires_in = process.env.JWT_TIMEOUT_DURATION;
            userData.access_token = jwt.sign(jwtPayload, secret, jwtData);
            userData.user = user_data;

            return apiResponse.successResponseWithData(res,200, req.t('Login success'), userData);

        }catch (err) {
            console.log(err)
            return apiResponse.ErrorResponse(res,500, req.t('INTERNAL SERVER ERROR'));
        }
    }
]



