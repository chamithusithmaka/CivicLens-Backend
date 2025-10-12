const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  electionType: {
    type: String,
    required: true,
    enum: ['Presidential', 'Parliamentary', 'Provincial', 'Local']
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  candidates: [{
    name: {
      type: String,
      required: true
    },
    party: {
      type: String,
      required: true
    },
    imageUrl: String,
    manifesto: String,
    votes: {
      type: Number,
      default: 0
    }
  }],
  provinces: [{
    name: String,
    leadingParty: String,
    results: [{
      party: String,
      votes: Number,
      percentage: Number
    }]
  }],
  voterTurnout: {
    type: Number,
    default: 0
  },
  isUpcoming: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  facts: [{
    text: String,
    category: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, { timestamps: true });

const Election = mongoose.model('Election', electionSchema);
module.exports = Election;