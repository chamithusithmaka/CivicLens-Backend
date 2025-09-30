const Level = require("../models/Level");

// Create a new level
exports.createLevel = async (data) => {
  try {
    const { name, order } = data;
    const level = new Level({ name, order });
    await level.save();
    return level;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get all levels (sorted by order)
exports.getAllLevels = async () => {
  try {
    const levels = await Level.find().sort({ order: 1 });
    return levels;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Get single level by ID
exports.getLevelById = async (id) => {
  try {
    const level = await Level.findById(id);
    if (!level) throw new Error("Level not found");
    return level;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Update level
exports.updateLevel = async (id, data) => {
  try {
    const updated = await Level.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("Level not found");
    return updated;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Delete level
exports.deleteLevel = async (id) => {
  try {
    const deleted = await Level.findByIdAndDelete(id);
    if (!deleted) throw new Error("Level not found");
    return deleted;
  } catch (err) {
    throw new Error(err.message);
  }
};
