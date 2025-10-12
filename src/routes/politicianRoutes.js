const express = require("express");
const router = express.Router();
const politicianController = require("../controllers/politicianController");
const { upload } = require("../config/cloudinary");

// CRUD Routes
router.post("/", upload.single("image"), politicianController.createPolitician);
router.post("/upload-image/:id", upload.single("image"), politicianController.uploadImage);
router.get("/", politicianController.getAllPoliticians);
router.get("/level/:levelId", politicianController.getPoliticiansByLevel);
router.get("/:id", politicianController.getPoliticianById);
router.put("/:id", upload.single("image"), politicianController.updatePolitician);
router.delete("/:id", politicianController.deletePolitician);

module.exports = router;
