const express = require('express');
const { saveQuizHistory, getUserQuizHistory, getQuizHistoryDetail } = require('../controllers/quizHistoryController');

const router = express.Router();

// POST - save quiz history
router.post('/', saveQuizHistory);

// GET - get user's quiz history
router.get('/:userId', getUserQuizHistory);

// GET - get specific quiz detail
router.get('/detail/:quizId', getQuizHistoryDetail);

module.exports = router;