
const express = require('express')
const dbConnect = require('./config/dbConnect')
const cors = require('cors');
const  cookieParser = require('cookie-parser')
const multer = require('multer');
const path = require('path');



const signup = require('./routes/signup.js');
const login = require('./routes/login.js');
const reGenerateOTP = require('./routes/reGenerateOTP.js');
const otpVerification = require('./routes/otpVerification.js'); 
const createNewCard = require('./routes/card.js')
const fetchCardDetails = require('./routes/fetchCardDetails.js'); 



const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


dbConnect();
const PORT = process.env.PORT || 4000;


app.use('/api/v1',signup);
app.use('/api/v1',login);
app.use('/api/v1',otpVerification);
app.use('/api/v1',reGenerateOTP);
app.use('/api/v1',upload.any(),createNewCard)
app.use('/api/v1',fetchCardDetails)
 
app.listen(PORT,() => {
    console.log('server listening on port'+PORT)
})