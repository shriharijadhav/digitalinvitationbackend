const generateOTPTemplate = (otp,firstName,lastName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
    </head>
    <body >
        <div class="container" >
            <div class="header" style="display: flex; width: 100%; justify-content: center; align-items: center;">
                <h2 class='otpDiv' style="border: 1px solid black; width:max-content; padding: 7px 10px; border-radius: 5px; background-color: lightgrey;">${otp}</h2>
            </div>
            <div class="content">
                <p style="font-size:16px;padding-top:10px;">Dear ${firstName} ${lastName},<br>Thank you for signing up!</p>
                <p style="font-size:16px;padding-top:10px;">To complete your registration, please use the above One-Time Password (OTP) to verify your account.<br>This OTP is valid for the next 5 minutes.</p>
                <p style="font-size:16px;"> Please do not share this OTP with anyone for security reasons.</p>
                <p style="font-size:16px;">If you did not request this email, please ignore it.</p>
                <p style="font-size:16px;padding-top:10px;">Best regards,<br>Secure Login System</p>
            </div>
            <div class="footer" style="padding-top:10px;">
                <p  >&copy; ${new Date().getFullYear()} Secure Login System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = generateOTPTemplate;
