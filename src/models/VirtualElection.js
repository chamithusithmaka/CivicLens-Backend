const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  politician: { type: mongoose.Schema.Types.ObjectId, ref: "Politician", required: true },
  votes: { type: Number, default: 0 }
}, { _id: false });

const VirtualElectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },           // maps to electionName in RN
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // array of candidate objects with politician reference and vote count
    candidates: [CandidateSchema],

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },

    // totalVotes is derived, but a field can be handy for caching (optional)
    totalVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VirtualElection", VirtualElectionSchema);
