const Question = require('../models/Question');

// Get N random published questions (for quiz)
exports.getRandomQuestions = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 15; // default to 15
    const questions = await Question.aggregate([
      { $match: { isPublished: true } },
      { $sample: { size: count } }
    ]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all published questions (for quiz)
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ isPublished: true }).sort({ order: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Add a new question
exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};