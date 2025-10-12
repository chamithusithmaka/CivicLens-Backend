const mongoose = require('mongoose');

// Schema for replies to comments
const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  replyText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Schema for reactions to comments
const ReactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reactionType: { 
    type: String, 
    enum: ['like', 'heart', 'angry', 'funny'],
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

// Main UserFeedback Schema for comments
const UserFeedbackSchema = new mongoose.Schema({
  promiseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promise', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  commentText: { type: String, required: true },
  reactions: [ReactionSchema], // Array of reactions
  replies: [ReplySchema], // Array of replies
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual field to get total reaction counts
UserFeedbackSchema.virtual('reactionCounts').get(function() {
  const counts = { like: 0, heart: 0, angry: 0, funny: 0, total: 0 };
  this.reactions.forEach(reaction => {
    counts[reaction.reactionType]++;
    counts.total++;
  });
  return counts;
});

// Ensure virtual fields are serialized
UserFeedbackSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UserFeedback', UserFeedbackSchema);