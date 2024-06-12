const otpModel = require('../models/otp');
const userModel = require('../models/user');
const mailSender = require('../utility/mailSender');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const reGenerateOtp = async(req,res) => {
    try {
        const {userEmail} = req.body;

        if(!userEmail){
            return res.status(200).json({
                message:'Empty user email. OTP regeneration is not allowed',
                success:false
            }) 
        }

        const userFetchedFromDB = await userModel.findOne({email:userEmail});

        if(!userFetchedFromDB){
            return res.status(200).json({
                message:'User is not registered. Please sign up.',
                userIsNotRegistered:true,
                success:false
            })
        }

        if(userFetchedFromDB.isVerifiedAccount){
            return res.status(200).json({
                message:'Account is already verified. Please login',
                isAccountAlreadyVerified:true,
                success:false
            })
        }

        
        const firstName = userFetchedFromDB.firstName;
        const lastName = userFetchedFromDB.lastName;
        const email = userFetchedFromDB.email;

        // check if otp exists for user
        const otpExists = await otpModel.find({email:userEmail}).sort({createdAt:-1}).limit(1);

        if(otpExists.length > 0){
            
            const x_otp = otpExists[0].otp;

            // const mailInfo = await mailSender(email,'Secure Login System || Account Verification email',x_otp,firstName,lastName);

            const payload = {
                userEmail:email,
                tokenExpiresAt:Date.now()+ 5*60*1000,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '300s' });

            
            if(token){
                return res.status(200).json({
                    message:'OTP exists in DB. No need to re-generate OTP',
                    isMailSent:false,
                    isOTPExistsInDB:true,
                    success:true,
                    token
                })
            }

        }

        // create new OTP
        const randomBytes = crypto.randomBytes(6);
        const randomNumber = BigInt('0x'+randomBytes.toString('hex')).toString().slice(0,6);
        const newOtp = randomNumber.toString();

        const savedOtpDoc = await otpModel.create({email:userEmail,otp:newOtp});
        const otp = savedOtpDoc.otp;

       
        if(!savedOtpDoc){
            return res.status(200).json({
                message:'Failed to save new OTP in DB',
                success:false
            })
        }


        const mailInfo = await mailSender(email,'Secure Login System || Account Verification email',otp,firstName,lastName);


        if(!mailInfo){
            return res.status(200).json({
                message:'OTP re-generated successfully',
                isMailSent:false,
                success:false
            })  
        }

        const payloadTwo = {
            userEmail:email,
            tokenExpiresAt:Date.now()+ 5*60*1000,
        }
        const tokenTwo = jwt.sign(payloadTwo, process.env.JWT_SECRET, { expiresIn: '300s' });
        return res.status(200).json({
            message:'OTP re-generated successfully',
            isMailSent:true,
            token:tokenTwo,
            success:true
        })



    } catch (error) {
        return res.status(200).json({
            message:'OTP - re-generation failed',
            success:false,
            error
        }) 
    }
}

module.exports = reGenerateOtp;