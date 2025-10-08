const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "President", "Prime Minister"
  level: { 
    type: String, 
    enum: ["President", "PrimeMinister", "CabinetMinister", "MP", "ProvincialMember", "LocalAuthorityMember"], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // null if ongoing
  region: { type: String }, // for Provincial/Local levels
}, { timestamps: true });

module.exports = mongoose.model("Role", RoleSchema);