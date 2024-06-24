const user = require('../models/user');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { token } = require('morgan');
const path = require('path');
const otpModel = require('../models/otp');
const crypto = require('crypto');
const mailSender = require('../utility/mailSender');
require('dotenv').config();

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const token = req?.cookies?.secureLoginCookie;

        // console.log('object,',token)
        const exitingUser = await user.findOne({ email: email});

        if(!exitingUser) {
            return res.status(404).json({
                message:'User not found. Please sign up first.',
                success: false,
                loginSuccess: false,

            })
        }

        const isPasswordValid = await argon2.verify(exitingUser.password, password);

        if(!isPasswordValid) {
            return res.status(200).json({
                message:'Invalid password.',
                isInvalidPassword: true,
                success: false,
                loginSuccess: false,

            }) 
        }

        // 
        if(isPasswordValid) {
            
            // check if user is verified first
            if (exitingUser.isVerifiedAccount) {
                const payload = {
                    _id:exitingUser._id,
                    email:exitingUser.email
                }
    
                jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                    if (err) {
                        console.error('Error signing the token:', err);
                        return;
                    }
                    // Use the token here
                    const cookieOptions = {
                        expires:new Date(Date.now()+ 5*1000),
                        httpOnly: false,       // Prevents JavaScript access to the cookie (mitigates XSS attacks)
                     }
                    
                    // console.log('Token:', token);
                     return res.cookie('secureLoginCookie',token,cookieOptions).status(200).json({
                        message: 'Login successful',
                        loginSuccess: true,
                        proceedToVerifyAccountScreen:false,
                        userDetails: exitingUser,
                        success:true,
                    })
                });
            } else {

                try {

                    const email = exitingUser.email;
                    const firstName = exitingUser.firstName;
                    const lastName = exitingUser.lastName;

                    // check if otp is already send over mail and still valid (exists in database) 
                    const isOTPExistsInDB =  await otpModel.findOne({email: email})

                    const payloadOne = {
                        userEmail:email,
                        tokenExpiresAt:Date.now()+ 5*60*1000,
                    }
                    const tokenOne = jwt.sign(payloadOne, process.env.JWT_SECRET, { expiresIn: '300s' });

                    if(isOTPExistsInDB){
                        return res.status(200).json({
                            message: 'User account is not verified. Please verify your account and try again.',
                            userEmail:email,
                            isOtpValid:true,
                            loginSuccess: false,
                            proceedToAccountVerificationScreen:true,
                            action:'login',
                            token:tokenOne
                            // savedOtpDoc
                        }) 
                    }

        
                    const payload = {
                        userEmail:email,
                        tokenExpiresAt:Date.now()+ 5*60*1000,
                    }
                    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '300s' });
                    const url = process.env.ACCOUNT_VERIFICATION_FRONTEND_URL + token;
                    // console.log('url: ' + url)
        
                    const randomBytes = crypto.randomBytes(6);
                    const randomNumber = BigInt('0x'+randomBytes.toString('hex')).toString().slice(0, 6);
                    const newOtp = randomNumber.toString();

                    const savedDocument = await otpModel.create({email:email,otp:newOtp})
                    const otp = savedDocument.otp;

                    // console.log(email, otp,firstName,lastName,url);
                    
                    await mailSender(email,'Secure Login System || Account Verification email',otp,firstName,lastName,url);

                    return res.status(200).json({
                        message: 'User account is not verified. Please verify your account and try again.',
                        userEmail:email,
                        loginSuccess: false,
                        proceedToAccountVerificationScreen:true,
                        action:'login',
                        email,
                        token
                        // savedOtpDoc
    
                    })
                    
                } catch (error) {
                    return res.status(200).json({
                        message: 'Login failed- token creation error',
                        success:false,
                    }) 
                }

                
            }
            
            // create a JWT token
            
        }


    } catch (error) {
        return res.status(200).json({
            message: 'Login failed',
            success:false,
            error: error
        })
    }
}