const levelService = require("../services/levelService");

// Create a level
exports.createLevel = async (req, res) => {
  try {
    const level = await levelService.createLevel(req.body);
    res.status(201).json(level);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all levels
exports.getAllLevels = async (req, res) => {
  try {
    const levels = await levelService.getAllLevels();
    res.status(200).json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get level by ID
exports.getLevelById = async (req, res) => {
  try {
    const level = await levelService.getLevelById(req.params.id);
    res.status(200).json(level);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Update level
exports.updateLevel = async (req, res) => {
  try {
    const updated = await levelService.updateLevel(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete level
exports.deleteLevel = async (req, res) => {
  try {
    const deleted = await levelService.deleteLevel(req.params.id);
    res.status(200).json({ message: "Level deleted successfully", deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
