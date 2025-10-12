const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get all notifications for a user
router.get('/user/:userId', auth, notificationController.getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read/:userId', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all/:userId', auth, notificationController.markAllAsRead);

// Update user notification preferences
router.put('/preferences/:userId', auth, notificationController.updateNotificationPreferences);

// Get user notification preferences
router.get('/preferences/:userId', auth, notificationController.getNotificationPreferences);

// Update FCM token
router.put('/fcm-token/:userId', auth, notificationController.updateFcmToken);

// Send test notification to user
router.post('/test/:userId', auth, notificationController.sendTestNotification);

// Get unread notification count
router.get('/unread-count/:userId', auth, notificationController.getUnreadCount);

module.exports = router;