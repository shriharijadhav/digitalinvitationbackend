
const express = require('express')
const dbConnect = require('./config/dbConnect')
const cors = require('cors');
const  cookieParser = require('cookie-parser')


const signup = require('./routes/signup.js');
const login = require('./routes/login.js');
const reGenerateOTP = require('./routes/reGenerateOTP.js');
const otpVerification = require('./routes/otpVerification.js'); 

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors());



dbConnect();
const PORT = process.env.PORT || 4000;


app.use('/api/v1',signup);
app.use('/api/v1',login);
app.use('/api/v1',otpVerification);
app.use('/api/v1',reGenerateOTP);
 
app.listen(PORT,() => {
    console.log('server listening on port'+PORT)
})