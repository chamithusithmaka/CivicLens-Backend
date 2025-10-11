const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  nic: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // URL or base64 string for profile image
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);