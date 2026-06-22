const express = require('express');
const router = express.Router();
const { submitPrediction, checkDuplicate, getPublicStats } = require('../controllers/predictionController');

router.post('/', submitPrediction);
router.get('/stats', getPublicStats);
router.get('/check/:phone', checkDuplicate);

module.exports = router;
