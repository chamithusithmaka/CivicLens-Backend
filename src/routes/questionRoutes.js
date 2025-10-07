const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Get N random published questions (for quiz)
router.get('/random', questionController.getRandomQuestions);

// Get all published questions (for admin or full list)
router.get('/', questionController.getAllQuestions);

// Admin: Add a new question
router.post('/', questionController.createQuestion);

// Admin: Update a question
router.put('/:id', questionController.updateQuestion);

// Admin: Delete a question
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;