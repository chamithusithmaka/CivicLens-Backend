const mongoose = require("mongoose");

const LevelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "President", "Prime Minister"
  order: { type: Number, required: true }, // defines position in hierarchy (1 = top)
}, { timestamps: true });

module.exports = mongoose.model("Level", LevelSchema);