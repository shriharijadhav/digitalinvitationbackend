const express = require('express');
const reGenerateOtp = require('../controllers/reGenerateOtp');
const router = express.Router();

router.post('/reGenerateOTP',reGenerateOtp);

module.exports = router;