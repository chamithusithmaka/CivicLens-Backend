const News = require('../models/news');
const notificationService = require('../services/notificationService');

// Get all news without pagination
exports.getAllNews = async (req, res) => {
  try {
    // Get all active news without filters
    const news = await News.find({ isActive: true }).sort({ createdAt: -1 });
    
    console.log(`Found ${news.length} news items`);
    
    // Return in a consistent format that matches your other endpoints
    res.status(200).json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    console.error('Error getting news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

// Get news by ID
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }
    
    res.json(news);
  } catch (error) {
    console.error('Error getting news by ID:', error);
    res.status(500).json({ success: false, error: 'Error getting news by ID' });
  }
};

// Create new news
exports.createNews = async (req, res) => {
  try {
    const { title, content, summary, imageUrl, category, author, source, isBreaking, tags } = req.body;
    
    // Create news
    const news = new News({
      title,
      content,
      summary,
      imageUrl,
      category,
      author,
      source,
      isBreaking: isBreaking || false,
      tags: tags || []
    });
    
    // Save news
    await news.save();
    
    // Send notification for breaking news
    if (isBreaking) {
      await notificationService.sendNotificationBasedOnPreferences(
        'news', 
        'breakingNews',
        'Breaking News!',
        title,
        {
          type: 'news',
          newsId: news._id.toString(),
          category
        },
        news._id,
        'News',
        imageUrl
      );
    } else {
      // Send regular news notification based on category preference
      await notificationService.sendNotificationBasedOnPreferences(
        'news',
        null,
        'New Article',
        title,
        {
          type: 'news',
          newsId: news._id.toString(),
          category
        },
        news._id,
        'News',
        imageUrl
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create news',
      error: error.message
    });
  }
};

// Update news
exports.updateNews = async (req, res) => {
  try {
    const { title, content, summary, imageUrl, category, author, source, isBreaking, tags, isActive } = req.body;
    
    // Find news
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Update fields
    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;
    if (summary !== undefined) news.summary = summary;
    if (imageUrl !== undefined) news.imageUrl = imageUrl;
    if (category !== undefined) news.category = category;
    if (author !== undefined) news.author = author;
    if (source !== undefined) news.source = source;
    if (isBreaking !== undefined) news.isBreaking = isBreaking;
    if (tags !== undefined) news.tags = tags;
    if (isActive !== undefined) news.isActive = isActive;
    
    // Save updated news
    await news.save();
    
    // Check if news was made breaking after update
    if (isBreaking && !news.isBreaking) {
      await notificationService.sendNotificationBasedOnPreferences(
        'news', 
        'breakingNews',
        'Breaking News!',
        news.title,
        {
          type: 'news',
          newsId: news._id.toString(),
          category: news.category
        },
        news._id,
        'News',
        news.imageUrl
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'News updated successfully',
      data: news
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update news',
      error: error.message
    });
  }
};

// Delete news (soft delete)
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Soft delete
    news.isActive = false;
    await news.save();
    
    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news',
      error: error.message
    });
  }
};

// Get breaking news
exports.getBreakingNews = async (req, res) => {
  try {
    const breakingNews = await News.find({ isBreaking: true });
    console.log('Found breaking news items:', breakingNews.length);
    res.status(200).json(breakingNews);
  } catch (error) {
    console.error('Error getting breaking news:', error);
    res.status(500).json({ error: 'Error getting breaking news' });
  }
};

// Get news by category
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log(`Looking for news with category: ${category}`);
    
    // Check if the category is valid
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category parameter is required' 
      });
    }
    
    // Use case-insensitive search
    const newsByCategory = await News.find({ 
      category: { $regex: new RegExp('^' + category + '$', 'i') }
    });
    
    console.log(`Found ${newsByCategory.length} news items for category: ${category}`);
    
    res.json({
      success: true,
      count: newsByCategory.length,
      data: newsByCategory
    });
  } catch (error) {
    console.error(`Error getting news by category ${req.params.category}:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Error getting news by category' 
    });
  }
};

// Get trending news based on read count
exports.getTrendingNews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const trendingNews = await News.find({ isActive: true })
      .sort({ readCount: -1 })
      .limit(parseInt(limit));
      
    res.status(200).json({
      success: true,
      count: trendingNews.length,
      data: trendingNews
    });
  } catch (error) {
    console.error('Error getting trending news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending news',
      error: error.message
    });
  }
};