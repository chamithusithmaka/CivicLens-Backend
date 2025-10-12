const express = require('express');
const router = express.Router();
const polibotController = require('../controllers/polibotController');

// Get politician information
router.get('/politician/:name', polibotController.getPoliticianInfo);

// Get party information
router.get('/party/:name', polibotController.getPartyInfo);

// Compare two politicians
router.get('/compare/:name1/:name2', polibotController.comparePoliticians);

// Get policy area information
router.get('/policy/:area', polibotController.getPolicyAreaInfo);

// Search across politicians, parties, and policy areas
router.get('/search/:query', polibotController.search);

module.exports = router;