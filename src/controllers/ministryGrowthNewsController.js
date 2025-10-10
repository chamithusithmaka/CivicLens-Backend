const MinistryGrowthNews = require('../models/MinistryGrowthNews');



// Get all news
exports.getAllNews = async (req, res) => {
  try {
    const news = await MinistryGrowthNews.find();
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get news by MongoDB ObjectId
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await MinistryGrowthNews.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
