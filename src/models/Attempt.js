// models/Attempt.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOptionIds: [{ type: mongoose.Schema.Types.ObjectId }], // for options types
  typedText: { type: String, default: '' },                     // for typing
  isCorrect: { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 },
  evaluationDetail: { type: Object, default: {} },
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  userId: { type:String}, // optional if you support auth
  anonKey: { type: String }, // fallback if anonymous users
  responses: [responseSchema],
  totalMarksAwarded: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  durationSec: { type: Number, default: 0 },
}, { timestamps: true });

attemptSchema.index({ userId: 1, createdAt: -1 });
attemptSchema.index({ anonKey: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
