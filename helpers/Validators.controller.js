let Validator = require('validatorjs');

const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath: 'logs.log',
        timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
    },
    log = SimpleNodeLogger.createSimpleLogger(opts);

module.exports.checkValidators = async (rules, req, res) => {
    try {
        return new Promise((resolve, reject) => {
            validator(req, rules, {}, (err, status) => {
                if (!status) {
                    validations(err).then(res => {
                        resolve(1)
                    }).catch(err => {
                        reject(res.send(err))
                    });
                } else {
                    resolve(1)
                }
            });
        })
    } catch (e) {
        log.error(e);
    }
}

function validations(data) {
    return new Promise((resolve, reject) => {
        for (var key in data.errors) {
            reject({ status: { code: 1, message: data.errors[key][0] } })
        }
        resolve({ status: { code: 0, message: '' } })
    });
}

const validator = async (body, rules, customMessages, callback) => {
    const validation = await new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

