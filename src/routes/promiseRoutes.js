const express = require('express');
const router = express.Router();
const promiseController = require('../controllers/promiseController');
const auth = require('../middleware/auth'); // Make sure this path is correct

// Existing routes
router.get('/promises', promiseController.getAllPromises);
router.get('/promises/:id', promiseController.getPromiseById);

// Promise reaction routes - MAKE SURE THESE ARE HERE
router.post('/promises/:id/reactions', auth, promiseController.addPromiseReaction);
router.delete('/promises/:id/reactions', auth, promiseController.removePromiseReaction);

module.exports = router;
