const otpModel = require('../models/otp');
const users = require('../models/user');

exports.otpVerification = async (req,res) => {
    const {email,otpFromRequest} = req.body;

    // console.log(email,otpFromRequest)

    if(!otpFromRequest){
        return res.status(200).json({
            message:'Invalid otp from request'
        })
    }

    // check if user is registered 
    const userFromDB = await users.findOne({email:email});
    if(!userFromDB){
        return res.status(200).json({
            message:'User not registered. please sign up first.',
            isUserNotRegistered: true,
            loginSuccess: false,
            success:false
        })
    }
    // check if otp exists in database or expired
    const otpDetails = await otpModel.find({email:email}).sort({createdAt:-1}).limit(1);

    if(!otpDetails){
        return res.status(200).json({
            message:'OTP expired. please signup once again.',
            isOTPExpired: true,
            success:false
        })
    }
    const otpFromDB = otpDetails[0]?.otp;


    if(otpFromRequest !== otpFromDB){
        return res.status(200).json({
            message:'OTP does not match',
            isOTPExpired: false,
            isOTPMatching:false,
            success:false,
            loginSuccess: false,

        })
    }

    const updatedUser = await users.findOneAndUpdate({email:email},{isVerifiedAccount:true},{new:true});

    if(!updatedUser){
        return res.status(200).json({
            message:'Account verification failed',
            success:false
        })
    }

           
    return res.status(200).json({
        message:'Account verification successful',
        accountVerification:'done',
        success:false
    }) 
    



}