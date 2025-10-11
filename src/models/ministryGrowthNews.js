const mongoose = require('mongoose');

const MinistryGrowthNewsSchema = new mongoose.Schema({
  newsId: { type: String, unique: true },
  newsTitle: { type: String, required: true },
  newsImage: { type: String },
  newsDetails: { type: String },
  newsCategory: { type: String },
  newsDate: { type: Date },
  newsEvidence: [{
    type: { type: String, enum: ['video', 'pdf', 'word', 'excel', 'image', 'facebook', 'link', 'file', 'youtube'] },
    link: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('MinistryGrowthNews', MinistryGrowthNewsSchema);