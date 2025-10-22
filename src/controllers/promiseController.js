const Promise = require('../models/Promise');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');



// Get all promises
exports.getAllPromises = async (req, res) => {
  try {
    const promises = await Promise.find();
    res.status(200).json(promises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get promise by MongoDB ObjectId
exports.getPromiseById = async (req, res) => {
  try {
    const { id } = req.params;
    const promise = await Promise.findById(id);
    if (!promise) {
      return res.status(404).json({ error: 'Promise not found' });
    }
    res.status(200).json(promise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add reaction to promise
exports.addPromiseReaction = async (req, res) => {
  try {
    console.log('Add reaction request:', {
      promiseId: req.params.id,
      user: req.user,
      userId: req.user?.userId,
      reactionType: req.body.reactionType,
      headers: req.headers.authorization
    });

    const { id } = req.params;
    const { reactionType } = req.body;
    
    // Check if user is authenticated first
    if (!req.user || !req.user.userId) {
      console.log('User not authenticated - req.user:', req.user);
      return res.status(401).json({ error: 'User not authenticated. Please login.' });
    }

    const userId = req.user.userId;

    // Validate inputs
    if (!reactionType) {
      return res.status(400).json({ error: 'Reaction type is required' });
    }

    if (!['like', 'heart', 'angry', 'funny'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const promise = await Promise.findById(id);
    if (!promise) {
      return res.status(404).json({ error: 'Promise not found' });
    }

    // Check if user already reacted
    const existingReactionIndex = promise.reactions.findIndex(
      reaction => reaction.userId.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      promise.reactions[existingReactionIndex].reactionType = reactionType;
      promise.reactions[existingReactionIndex].createdAt = new Date();
    } else {
      // Add new reaction
      promise.reactions.push({
        userId,
        reactionType,
        createdAt: new Date()
      });
    }

    await promise.save();
    
    // Populate user data and return updated promise
    const updatedPromise = await Promise.findById(id).populate('reactions.userId', 'fullName');
    
    console.log('Reaction added successfully');
    res.status(200).json(updatedPromise);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove reaction from promise
exports.removePromiseReaction = async (req, res) => {
  try {
    console.log('Remove reaction request:', {
      promiseId: req.params.id,
      userId: req.user?._id
    });

    const { id } = req.params;
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const promise = await Promise.findById(id);
    if (!promise) {
      return res.status(404).json({ error: 'Promise not found' });
    }

    // Remove user's reaction
    promise.reactions = promise.reactions.filter(
      reaction => reaction.userId.toString() !== userId.toString()
    );

    await promise.save();
    
    // Return updated promise
    const updatedPromise = await Promise.findById(id).populate('reactions.userId', 'name');
    
    console.log('Reaction removed successfully');
    res.status(200).json(updatedPromise);
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: error.message });
  }
};

