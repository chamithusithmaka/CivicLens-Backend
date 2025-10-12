const Notification = require('../models/notification');
const User = require('../models/user');
const notificationService = require('../services/notificationService');
const mongoose = require('mongoose');

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1, read } = req.query;
    
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {
      $or: [
        { recipients: userId },
        { isGlobal: true }
      ]
    };
    
    // Filter by read status if provided
    if (read === 'true') {
      query.readBy = { $elemMatch: { user: userId } };
    } else if (read === 'false') {
      query.readBy = { $not: { $elemMatch: { user: userId } } };
    }
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: notifications
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId, userId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if already marked as read
    const alreadyRead = notification.readBy.some(item => item.user.toString() === userId);
    
    // If not already read, mark as read
    if (!alreadyRead) {
      notification.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      await notification.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all unread notifications for user
    const notifications = await Notification.find({
      $or: [
        { recipients: userId },
        { isGlobal: true }
      ],
      readBy: { $not: { $elemMatch: { user: userId } } }
    });
    
    // Mark each as read
    for (const notification of notifications) {
      notification.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      await notification.save();
    }
    
    res.status(200).json({
      success: true,
      message: `${notifications.length} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Update user notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update preferences
    if (preferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...preferences
      };
    }
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

// Get user notification preferences
exports.getNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
};

// Update FCM token
exports.updateFcmToken = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fcmToken } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update FCM token
    user.fcmToken = fcmToken;
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully'
    });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FCM token',
      error: error.message
    });
  }
};

// Send test notification to user
exports.sendTestNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Store notification in database first
    const notification = new Notification({
      title: 'Test Notification',
      body: 'This is a test notification from CivicLens',
      type: 'system',
      recipients: [userId]
    });
    
    await notification.save();
    
    // Attempt to send push notification
    const result = await notificationService.sendNotificationToUser(
      userId,
      'Test Notification',
      'This is a test notification from CivicLens',
      { 
        type: 'test',
        notificationId: notification._id.toString() 
      }
    );
    
    // Even if push notification fails, return success because the notification was stored
    res.status(200).json({
      success: true,
      message: 'Test notification created successfully',
      pushNotificationSent: result.success,
      pushNotificationDetails: result.success ? result : { error: result.message },
      notification: notification
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Count unread notifications
    const count = await Notification.countDocuments({
      $or: [
        { recipients: userId },
        { isGlobal: true }
      ],
      readBy: { $not: { $elemMatch: { user: userId } } }
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread notification count',
      error: error.message
    });
  }
};