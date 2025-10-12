// models/Question.js
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
}, { _id: true });

const typingAnswerSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  weight: { type: Number, default: 1 }, // partial-credit weight (0..1+)
}, { _id: false });

const scoringSchema = new mongoose.Schema({
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  partialCredit: { type: Boolean, default: false },
}, { _id: false });

const matchingSchema = new mongoose.Schema({
  mode: { type: String, enum: ['EXACT', 'CASE_INSENSITIVE', 'IGNORE_PUNCTUATION', 'FUZZY'], default: 'CASE_INSENSITIVE' },
  fuzzyThreshold: { type: Number, default: 0.82 },  // 0..1
  normalizeSinhala: { type: Boolean, default: true },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['SINGLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'TYPING'], required: true },
  prompt: { type: String, required: true, trim: true },
  media: { imageUrl: String, videoUrl: String },
  options: [optionSchema],               // for non-typing
  typingAccepted: [typingAnswerSchema],  // for typing
  typingMatching: matchingSchema,
  scoring: { type: scoringSchema, default: () => ({}) },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }, // include in live quiz
  meta: { topic: String, source: String },
}, { timestamps: true });

questionSchema.index({ isPublished: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
