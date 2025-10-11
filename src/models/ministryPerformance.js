const mongoose = require('mongoose');

const KeyPerformanceIndicatorSchema = new mongoose.Schema({
  ministry: { type: String, required: true },
  budget: { type: String, required: true }, // e.g. "$5.2B"
  utilization: { type: String, required: true }, // e.g. "92%"
  status: { type: String, enum: ['On Track', 'At Risk', 'Needs Improvement'], required: true }
});

const AnnualFinancialOverviewSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  profit: { type: Number, required: true },
  loss: { type: Number, required: true }
});

const MinistryPerformanceSchema = new mongoose.Schema({
  annualFinancialOverview: [AnnualFinancialOverviewSchema], // Array of yearly profit/loss
  overallProfitsLoss: {
    profit: { type: Number, required: true },
    loss: { type: Number, required: true }
  },
  keyPerformanceIndicators: [KeyPerformanceIndicatorSchema]
}, { timestamps: true });

module.exports = mongoose.model('MinistryPerformance', MinistryPerformanceSchema);