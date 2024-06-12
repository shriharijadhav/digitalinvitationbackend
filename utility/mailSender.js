const nodemailer = require('nodemailer');
const generateOTPTemplate = require('../mailTemplates/otpTemplate');

require('dotenv').config();

const mailSender = async (email,subject,otp,firstName,lastName)=>{
    try {
        let transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })
        const htmlBody = generateOTPTemplate(otp,firstName,lastName);
        // console.log(htmlBody)

        const infoObj = {
            from:process.env.MAIL_USER,
            to:email,
            subject:subject,
            html: htmlBody,
        }


        transporter.sendMail(infoObj,(error,emailResponse)=>{
            if (error) {
                return res.status(200).json({
                    message:'Failed to send mail'
                })
            }
           
         })

         return true;


    } catch (error) {
        return false;
    }
}

module.exports = mailSender;