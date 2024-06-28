const express = require('express');
const { fetchCardDetails } = require('../controllers/fetchCardDetails');
const router = express.Router();

router.post('/fetchCardDetails',fetchCardDetails)

module.exports = router