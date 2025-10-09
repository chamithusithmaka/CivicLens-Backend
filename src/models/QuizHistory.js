const mongoose = require('mongoose');

const quizHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      default: 'English',
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    questions: [{
      question: {
        type: String,
        required: true,
      },
      correctAnswer: {
        type: String,
        required: true,
      },
      userAnswer: {
        type: String,
        default: '',
      },
    }],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);

module.exports = QuizHistory;