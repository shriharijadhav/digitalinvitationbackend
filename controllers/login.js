const UserModel = require('../models/user');
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
       
        const existingUser = await UserModel.findOne({ email: email});
        console.log(req.cookies.secureLoginCookie); // Correct way to access cookies
        console.log(existingUser)

        if(!existingUser) {
            return res.status(404).json({
                message:'User not found. Please sign up first.',
                success: false,
                loginSuccess: false,

            })
        }
        const isPasswordValid = await argon2.verify(existingUser.password, password);

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
            console.log(isPasswordValid)
            
            // check if user is verified first
            if (existingUser.isVerifiedAccount) {
                const payload = {
                    _id:existingUser._id,
                    email:existingUser.email
                }
    
                jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                    if (err) {
                      console.error('Error signing the token:', err);
                      return res.status(500).json({ error: 'Internal Server Error' });
                    }
              
                    const cookieOptions = {
                    httpOnly: true,
                    secure: true, // Set to true if using HTTPS
                    sameSite: 'Lax', // Or 'Strict'
                    maxAge: 1000 * 60 * 60 * 24, // 1 day
                    };
              
                    return res
                      .cookie('secureLoginCookie', token, cookieOptions)
                      .status(200)
                      .json({
                        message: 'Login successful',
                        loginSuccess: true,
                        proceedToVerifyAccountScreen: false,
                        userDetails: { ...existingUser, password: null }, // Send user details without password
                        success: true,
                      });
                  });
                console.log('login successful')
            } else {

                try {

                    const email = existingUser.email;
                    const firstName = existingUser.firstName;
                    const lastName = existingUser.lastName;

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