const mongoose = require('mongoose');

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
  dueDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Promise', PromiseSchema);
