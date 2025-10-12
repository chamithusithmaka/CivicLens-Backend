const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Special routes first
router.get('/breaking', newsController.getBreakingNews);
router.get('/trending', newsController.getTrendingNews);
router.get('/category/:category', newsController.getNewsByCategory);

// General routes
router.get('/', newsController.getAllNews);

// ID-specific routes last
router.get('/:id', newsController.getNewsById);
router.put('/:id', newsController.updateNews);
router.delete('/:id', newsController.deleteNews);
router.post('/', newsController.createNews);

module.exports = router;