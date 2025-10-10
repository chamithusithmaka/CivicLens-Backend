const express = require('express');
const router = express.Router();
const { getAllPromises, getPromiseById } = require('../controllers/promiseController');



// Route to get all promises
router.get('/promises', getAllPromises);


// Route to get promise by object id
router.get('/promises/:id', getPromiseById);

module.exports = router;
