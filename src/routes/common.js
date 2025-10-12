const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

// Insert (create) a record: POST /api/common/:model
router.post('/:model', commonController.createRecord);
//68e4ae1c47c4afacfcf50d4b party 
//68e4aebefd3495d6bfffe40d role
//68e4b0dd062d5720d1e4aad0 ranil
// Get all records: GET /api/common/:model
router.get('/:model', commonController.getAllRecords);

module.exports = router;
