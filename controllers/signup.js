require('dotenv').config();


const Users = require('../models/user');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

exports.signup = async(req,res) => {
    try {
        const {firstName, lastName, email, password, confirmPassword} = req.body;
        console.log(req.body)
    // console.log(firstName, lastName, email, password, confirmPassword);

    // validation
    if(password !== confirmPassword) {
        return res.status(401).json({
            message: 'Password and confirm password are not matching.',
            success:false,
        }) 
    }

    // check if user is already registered
    const userFromDb = await Users.findOne({ email:email})


    if(userFromDb){
        return res.status(200).json({
            message: 'User already registered. Please login.',
            isUserAlreadyExist: true,
            proceedToAccountVerificationScreen:false,
            success:false,
        })
    }

    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // if not already registered, register user by creating a new entry in the database
    await Users.create({ email:email, password:hashedPassword, firstName:firstName, lastName:lastName,imageUrl:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`});

    // before sending response back make password null
    const payloadTwo = {
        userEmail:email,
        tokenExpiresAt:Date.now()+ 5*60*1000,
    }
    const token = jwt.sign(payloadTwo, process.env.JWT_SECRET, { expiresIn: '300s' });
 
    return res.status(200).json({
        message: 'Signup successful',
        success:true,
        isUserAlreadyExist: false,
        proceedToAccountVerificationScreen:true,
        action:'signup',
        email,
        token
    });
    } catch (error) {
        return res.status(500).json({
            message: 'Signup failed',
            // userInfo:savedUser
        });  
    }
}