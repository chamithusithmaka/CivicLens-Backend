const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String,  unique: true },
  nic: { type: String, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // URL or base64 string for profile image
  createdAt: { type: Date, default: Date.now },
  notificationPreferences: {
    news: {
      enabled: { type: Boolean, default: true },
      categories: {
        Politics: { type: Boolean, default: true },
        Economy: { type: Boolean, default: true },
        Social: { type: Boolean, default: true },
        Elections: { type: Boolean, default: true },
        International: { type: Boolean, default: true },
        Other: { type: Boolean, default: true }
      },
      breakingNews: { type: Boolean, default: true }
    },
    elections: {
      enabled: { type: Boolean, default: true },
      electionCountdown: { type: Boolean, default: true },
      electionResults: { type: Boolean, default: true },
      electionFacts: { type: Boolean, default: true }
    },
    promises: {
      enabled: { type: Boolean, default: true }
    },
    ministries: {
      enabled: { type: Boolean, default: true }
    },
    system: {
      enabled: { type: Boolean, default: true }
    }
  },
  fcmToken: { type: String },
  district: { type: String }
});

module.exports = mongoose.model('User', UserSchema);