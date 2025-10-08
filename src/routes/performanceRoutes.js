const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// Get dashboard data for a specific politician
router.get('/dashboard/:politicianId', performanceController.getPoliticianDashboard);

// Get all politicians with performance data
router.get('/politicians', performanceController.getAllPoliticianPerformance);

// Get ministry performance data
router.get('/ministries', performanceController.getMinistryPerformance);

// Compare promises between politicians
router.post('/compare', performanceController.comparePromisesById);

// Get party performance
router.get('/parties', performanceController.getPartyPerformance);

module.exports = router;