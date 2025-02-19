var nodemailer = require('nodemailer');
var {emailtemplate} =require('../template/email/email')


exports.sendmail = function (from, to, subject, html) {

	if (process.env.EMAIL_ENABLE == 'TRUE') {
		var mailOptions = {
			from: from,
			to: to,
			subject: subject,
			html: emailtemplate(html)
		};

		/**Send e-mail using SMTP*/
		// mailOptions.subject = subject;

		var smtpTransporter = nodemailer.createTransport({
			port: process.env.MAIL_PORT,
			host: process.env.MAIL_HOST,
			secure: false,
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
			debug: true
		});

		smtpTransporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error);
			} else {
				// console.log(mailOptions)
				console.log('Message sent: ' + info.response);
			}
		});
	}
};