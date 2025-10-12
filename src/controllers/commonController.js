const Politician = require('../models/Politician');
const Party = require('../models/Party');
const Role = require('../models/Role');
const PromiseModel = require('../models/Promise');
const Attempt = require('../models/Attempt');

// Insert (create) a new record
exports.createRecord = async (req, res) => {
  const { model } = req.params;
  let Model;
  console.log(`[createRecord] Model param:`, model);
  switch (model) {
    case 'politician': Model = Politician; break;
    case 'party': Model = Party; break;
    case 'role': Model = Role; break;
    case 'promise': Model = PromiseModel; break;
    case 'attempt': Model = Attempt; break;
    default: 
      console.error(`[createRecord] Invalid model:`, model);
      return res.status(400).json({ error: 'Invalid model' });
  }
  try {
    console.log(`[createRecord] Request body:`, req.body);
    const record = new Model(req.body);
    await record.save();
    console.log(`[createRecord] Saved record:`, record);
    res.status(201).json(record);
  } catch (err) {
    console.error(`[createRecord] Error:`, err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get all records for a model
exports.getAllRecords = async (req, res) => {
  const { model } = req.params;
  let Model;
  console.log(`[getAllRecords] Model param:`, model);
  switch (model) {
    case 'politician': Model = Politician; break;
    case 'party': Model = Party; break;
    case 'role': Model = Role; break;
    case 'promise': Model = PromiseModel; break;
    case 'attempt': Model = Attempt; break;
    default: 
      console.error(`[getAllRecords] Invalid model:`, model);
      return res.status(400).json({ error: 'Invalid model' });
  }
  try {
    const records = await Model.find();
    console.log(`[getAllRecords] Found ${records.length} records`);
    res.json(records);
  } catch (err) {
    console.error(`[getAllRecords] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
};