const Promise = require('../models/Promise');
const multer = require('multer');
const path = require('path');



// Get all promises
exports.getAllPromises = async (req, res) => {
  try {
    const promises = await Promise.find();
    res.status(200).json(promises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get promise by MongoDB ObjectId
exports.getPromiseById = async (req, res) => {
  try {
    const { id } = req.params;
    const promise = await Promise.findById(id);
    if (!promise) {
      return res.status(404).json({ error: 'Promise not found' });
    }
    res.status(200).json(promise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

