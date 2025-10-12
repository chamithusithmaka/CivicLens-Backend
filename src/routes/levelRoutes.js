const express = require("express");
const router = express.Router();
const levelController = require("../controllers/levelController");

// CRUD routes
router.post("/", levelController.createLevel);       // Create new level
router.get("/", levelController.getAllLevels);       // Get all levels
router.get("/:id", levelController.getLevelById);    // Get level by ID
router.put("/:id", levelController.updateLevel);     // Update level
router.delete("/:id", levelController.deleteLevel);  // Delete level

module.exports = router;
