const MinistryPerformance = require('../models/ministryPerformance');


// View all ministry performance entries
exports.viewAllPerformances = async (req, res) => {
  try {
    const performances = await MinistryPerformance.find();
    res.json(performances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
