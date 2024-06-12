const express = require('express');
const { otpVerification } = require('../controllers/otpVerification');
const router = express.Router();

router.post('/otpVerification',otpVerification);

module.exports = router;