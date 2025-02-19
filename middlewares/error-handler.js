const apiResponse = require("../helpers/apiResponse");
module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof(err) === 'string') {
        // custom application error
        return apiResponse.unauthorizedResponse(res, 401, err);
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return apiResponse.unauthorizedResponse(res, 401, 'Invalid Token');
    }

    // default to 500 server error
    return apiResponse.ErrorResponse(res, 500, err.message);
}