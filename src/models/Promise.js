const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reactionType: { 
    type: String, 
    enum: ['like', 'heart', 'angry', 'funny'],
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

const PromiseSchema = new mongoose.Schema({
    promiseID: { type: String, unique: true },
  politicianID: { type: String },
  ministerName: { type: String },
  ministryName: { type: String },
  promiseCategory: { type: String },
  promiseTitle: { type: String },
  promiseImage: { type: String }, // URL or path to image
  promiseDetails: { type: String },
  promiseStatus: { type: String, enum: ['pending', 'complete', 'broken'], default: 'pending' },
  evidence: [{
    type: { type: String, enum: ['video', 'pdf', 'word', 'excel'] },
    link: { type: String }
  }],
  promiseFulfillment: { type: Number, default: 0 },
  performanceScore: { type: Number, default: 0 },
  publicApprovalRating: { type: Number, default: 0 },
  citizenFeedback: { type: String },
  fulfillmentRate: { type: Number, default: 0 },
  partialFulfillment: { type: Number, default: 0 },
  unfulfilledPromises: { type: Number, default: 0 },
  timeliness: { type: String },
  budgetAllocation: { type: Number, default: 0 },
  startDate: { type: Date },
  dueDate: { type: Date },

  // NEW: reactions recorded directly on promise (optional per-user reactions)
  reactions: [ReactionSchema]
}, { timestamps: true });

// Virtual to get aggregated reaction counts for the promise
PromiseSchema.virtual('reactionCounts').get(function() {
  const counts = { like: 0, heart: 0, angry: 0, funny: 0, total: 0 };
  const reactions = this.reactions || [];
  reactions.forEach(reaction => {
    const type = reaction.reactionType;
    if (type && Object.prototype.hasOwnProperty.call(counts, type)) {
      counts[type]++;
      counts.total++;
    }
  });
  return counts;
});

// Ensure virtual fields are serialized
PromiseSchema.set('toJSON', { virtuals: true });
PromiseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Promise', PromiseSchema);
