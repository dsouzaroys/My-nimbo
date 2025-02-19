var aws = require('aws-sdk')

exports.sendOtp = function (otp, countrycode, phoneno) {

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
    Message: "<#> Your Marena OTP code is: " + otp +  " Note: Please DO NOT SHARE this OTP with anyone. ",
    MessageStructure: 'string',
    PhoneNumber: countrycode+phoneno
  };

  sns.publish(params, function (err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    }
    else {
      console.log(data); // successful response
    }
  });

}
