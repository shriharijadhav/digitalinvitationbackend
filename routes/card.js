const express = require('express')
const { createNewCard } = require('../controllers/card')

const router = express.Router()

router.post('/createNewCard',createNewCard);

module.exports = router