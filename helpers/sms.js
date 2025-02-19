var aws = require('aws-sdk')
exports.sendsms = function (msg, countrycode, phoneno) {

  aws.config.update({
    region: process.env.SNS_REGION,
    accessKeyId: process.env.SNS_ACCESS_KEY,
    secretAccessKey: process.env.SNS_ACCESS_SECRET
  });
  var sns = new aws.SNS();
  sns.setSMSAttributes({
    attributes: { DefaultSMSType: "Transactional" }
  },
    function (error) {
      if (error) {
        console.log(error);
      }
    });

  var params = {
    Message: msg,
    MessageStructure: 'string',
    PhoneNumber: countrycode+phoneno
  };

  console.log("sms sent"+JSON.stringify(params))
  sns.publish(params, function (err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    }
    else {
      console.log(data);           // successful response
    }
  });

}
