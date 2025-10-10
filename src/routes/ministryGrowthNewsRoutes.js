const express = require('express');
const router = express.Router();
const ministryGrowthNewsController = require("../controllers/ministryGrowthNewsController");
const multer = require('multer');
const path = require('path');

// Multer setup for file upload
const storage = multer.diskStorage({
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	}
});
const upload = multer({ storage });

// Middleware for growth news file uploads
const uploadMiddleware = upload.fields([
	{ name: 'newsImage', maxCount: 1 },
	{ name: 'evidenceFiles', maxCount: 10 }
]);


// Get all news items
router.get('/growthNews', ministryGrowthNewsController.getAllNews);

// Get a news item by MongoDB ObjectId
router.get('/growthNews/:id', ministryGrowthNewsController.getNewsById);


module.exports = router;
