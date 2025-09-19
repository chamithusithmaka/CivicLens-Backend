const mongoose = require("mongoose");

const PartySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  abbreviation: { type: String, required: true },
  logo: { type: String }, // image URL
  color: { type: String, required: true }, // official hex code for badge
}, { timestamps: true });

module.exports = mongoose.model("Party", PartySchema);