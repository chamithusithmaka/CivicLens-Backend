const express = require("express");
const router = express.Router();
const partyController = require("../controllers/partyController");
const { upload } = require("../config/cloudinary");

// CRUD routes
router.post("/", upload.single("logo"), partyController.createParty);
router.post("/upload-logo/:id", upload.single("logo"), partyController.uploadLogo);
router.get("/", partyController.getAllParties);
router.get("/founder/:founder", partyController.getPartiesByFounder);
router.get("/:id", partyController.getPartyById);
router.put("/:id", upload.single("logo"), partyController.updateParty);
router.delete("/:id", partyController.deleteParty);

module.exports = router;