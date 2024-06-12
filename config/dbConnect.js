const mongoose = require('mongoose')

require('dotenv').config();

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL,{useUnifiedTopology:true,useNewUrlParser:true})
    .then(() => {
        console.log('Databases connected successfully')
    })
    .catch(() => {
        console.log('Databases connection failed');
        process.exit(1);
    });
}

module.exports = dbConnect;
