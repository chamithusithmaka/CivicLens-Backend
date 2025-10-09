const QuizHistory = require('../models/QuizHistory');

/**
 * Save a completed quiz to the database
 * POST /api/quiz/history
 */
const saveQuizHistory = async (req, res) => {
  try {
    const { userId, username, language, score, totalQuestions, category, feedback, questions } = req.body;
    
    // Validate required fields
    if (!userId) console.log("Missing userId");
    if (!username) console.log("Missing username");
    if (!score) console.log("Missing score");
    if (!totalQuestions) console.log("Missing totalQuestions");
    if (!category) console.log("Missing category");
    if (!questions) console.log("Missing questions");
    if (!feedback) console.log("Missing feedback");
    
    if (!userId || !username || score === undefined || !totalQuestions || !category || !questions || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing: {
          userId: !userId,
          username: !username,
          score: score === undefined,
          totalQuestions: !totalQuestions,
          category: !category,
          questions: !questions || !Array.isArray(questions),
          feedback: !feedback
        }
      });
    }
    
    // Ensure questions are properly formatted
    const processedQuestions = questions.map(q => ({
      question: q.question || "Unknown question",
      correctAnswer: q.correctAnswer || "Unknown answer",
      userAnswer: q.userAnswer || ""
    }));
    
    const newQuizHistory = new QuizHistory({
      userId,
      username,
      language: language || "English",
      score,
      totalQuestions,
      category,
      feedback,
      questions: processedQuestions
    });
    
    await newQuizHistory.save();
    
    res.status(201).json({
      success: true,
      quizHistoryId: newQuizHistory._id,
      message: 'Quiz history saved successfully'
    });
    
  } catch (err) {
    console.error('Error saving quiz history:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all quiz history for a specific user
 * GET /api/quiz/history/:userId
 */
const getUserQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const quizHistory = await QuizHistory.find({ userId })
      .sort({ date: -1 }) // Sort by date, newest first
      .select('-questions'); // Exclude questions array to reduce response size
    
    res.status(200).json({
      success: true,
      quizHistory
    });
    
  } catch (err) {
    console.error('Error getting user quiz history:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get details of a specific quiz attempt
 * GET /api/quiz/history/detail/:quizId
 */
const getQuizHistoryDetail = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quizDetail = await QuizHistory.findById(quizId);
    
    if (!quizDetail) {
      return res.status(404).json({
        success: false,
        message: 'Quiz history not found'
      });
    }
    
    res.status(200).json({
      success: true,
      quizDetail
    });
    
  } catch (err) {
    console.error('Error getting quiz history detail:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  saveQuizHistory,
  getUserQuizHistory,
  getQuizHistoryDetail
};