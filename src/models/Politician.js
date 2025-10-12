const mongoose = require("mongoose");

const PoliticianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // profile/banner image
  dateOfBirth: { type: Date },
  region: { type: String },
  yearsOfService: { type: Number },

  party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true },

  currentRole: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },

  // Historical Data
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  achievements: [{ type: String }],

  // electionRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: "ElectionRecord" }] // Commented out until ElectionRecord model is created
}, { timestamps: true });

module.exports = mongoose.model("Politician", PoliticianSchema);