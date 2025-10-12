// src/routes/geminiQuizRoutes.js
const express = require("express");
const { generateQuiz, analyzeQuiz } = require("../controllers/geminiQuiz");

const router = express.Router();

// POST - generate quiz
router.post("/generate", generateQuiz);

// POST - analyze answers
router.post("/analyze", analyzeQuiz);

module.exports = router;
