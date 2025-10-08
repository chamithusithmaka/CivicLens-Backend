const express = require("express");
const router = express.Router();
const politicianController = require("../controllers/politicianController");

// CRUD Routes
router.post("/", politicianController.createPolitician);
router.get("/", politicianController.getAllPoliticians);
router.get("/:id", politicianController.getPoliticianById);
router.put("/:id", politicianController.updatePolitician);
router.delete("/:id", politicianController.deletePolitician);

module.exports = router;
