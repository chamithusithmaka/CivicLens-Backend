const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema(
  {
    election: { type: mongoose.Schema.Types.ObjectId, ref: "VirtualElection", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Politician", required: true },
    voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User who voted
  },
  { timestamps: true }
);

// Prevent duplicate votes by same voter in same election
VoteSchema.index({ election: 1, voterId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);
