exports.emailtemplate = function (data)
 {
		const html=`<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <title>Lunarpants</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link type="image/x-icon" href=https://staging-app.lunarpants.com/favicon.ico rel="icon">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        
                body {
                    font-family: 'Open Sans', sans-serif;
                    background-color: #F8FAFC;
                    padding: 40px 48px 48px 48px;
                    margin: 0px;
                }
        
                .reset_box {
                    border-radius: 8px;
                    background: #FFF;
                    padding: 40px;
                    margin: 50px 0px;
                }
        
                .reset_head {
                    color: #121a26;
                    font-size: 16px;
                    font-weight: 700;
                    margin-bottom: 24px;
                }
        
                .reset_cont {
                    color: #384860;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 24px;
                }
        
                .reset_cont a {
                    color: #0D6EFD;
                }
        
                .reset_btn {
                    margin-top: 24px;
                    margin-bottom: 40px;
                }
        
                .reset_btn button {
                    border-radius: 8px;
                    background: #0D6EFD;
                    padding: 20px 40px;
                    border: none;
                    color: #FFF;
                    font-size: 14px;
                    font-weight: 700;
                }
        
                .reset_note {
                    color: #384860;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 24px;
                }
        
                .reset_note a {
                    color: #384860;
                }
            </style>
        </head>
        
        <body>
            <div class="main_container">
                <div class="logo">
                    <img src="https://staging-app.lunarpants.com/assets/logo.png" />
                </div>
                <div class="reset_box">
                    <div class="reset_head">Reset your password</div>
                    <div class="reset_cont">
                        Hello!
                        <br /><br />
                        Tap the button below to reset your password. If you did not request a new <br />password, you can safely
                        delete this email.
                    </div>
                    <div class="reset_btn">
                    <a href="${data}">
                        <button>Reset password</button>
                    </a>
                    </div>
                    <div class="reset_cont">
                        If the button doesn’t work, copy and paste the following link into your browser:
                        <a href="${data}" target="_blank">${data}</a>
                        <br /><br />
                        Lunarpants Team
                    </div>
                </div>
                <div class="reset_note">
                    Questions or FAQ? Contact us at <a href="mailto:info@lunarpants.com"
                        target="_blank">info@lunarpants.com</a>.
                    <br /><br />
                    Made in Fresno, CA © 2023 Lunarpants, LLC
                </div>
            </div>
        </body>
        
        </html>`

        return html;
}