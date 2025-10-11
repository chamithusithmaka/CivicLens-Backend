const express = require('express');
const router = express.Router();
const ministryPerformanceController = require('../controllers/ministryPerformanceController');


// View all ministry performance entries
router.get('/performance', ministryPerformanceController.viewAllPerformances);


module.exports = router;