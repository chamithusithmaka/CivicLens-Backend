const express = require('express');
const { deleteQuizHistory, saveQuizHistory, getUserQuizHistory, getQuizHistoryDetail } = require('../controllers/quizHistoryController');

const router = express.Router();

// DELETE - delete specific quiz history (keep only once, and keep it above the GET /:userId)
router.delete('/history/:quizId', deleteQuizHistory);

// POST - save quiz history
router.post('/', saveQuizHistory);

// GET - get specific quiz detail
router.get('/detail/:quizId', getQuizHistoryDetail);

// GET - get user's quiz history
router.get('/:userId', getUserQuizHistory);

module.exports = router;