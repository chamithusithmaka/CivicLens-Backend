const admin = require('../config/firebase');
const User = require('../models/user');
const Notification = require('../models/notification');

class NotificationService {
  // Send notification to a specific user
  async sendNotificationToUser(userId, title, body, data = {}, imageUrl = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.fcmToken) {
        console.log(`User ${userId} has no FCM token. Skipping push notification.`);
        return { success: false, message: 'No FCM token available for user' };
      }
      
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        },
        token: user.fcmToken
      };
      
      // Add image if provided
      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
      }
      
      try {
        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
      } catch (firebaseError) {
        console.error('Firebase messaging error:', firebaseError);
        
        // If token is invalid, clear it from the user
        if (firebaseError.code === 'messaging/invalid-argument' || 
            firebaseError.code === 'messaging/invalid-registration-token' ||
            firebaseError.code === 'messaging/registration-token-not-registered') {
          
          console.log(`Clearing invalid FCM token for user ${userId}`);
          user.fcmToken = null;
          await user.save();
        }
        
        return { 
          success: false, 
          message: firebaseError.message,
          code: firebaseError.code 
        };
      }
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }
  
  // Send notification to multiple users
  async sendNotificationToMultipleUsers(userIds, title, body, data = {}, imageUrl = null) {
    try {
      const users = await User.find({ _id: { $in: userIds } });
      const tokens = users.filter(user => user.fcmToken).map(user => user.fcmToken);
      
      if (tokens.length === 0) {
        return { success: false, message: 'No valid FCM tokens found' };
      }
      
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        },
        tokens
      };
      
      // Add image if provided
      if (imageUrl) {
        message.notification.imageUrl = imageUrl;
      }
      
      const response = await admin.messaging().sendMulticast(message);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Error sending notification to multiple users:', error);
      throw error;
    }
  }
  
  // Send notification to all users
  async sendNotificationToAllUsers(title, body, data = {}, imageUrl = null) {
    try {
      const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
      const tokens = users.map(user => user.fcmToken);
      
      if (tokens.length === 0) {
        return { success: false, message: 'No FCM tokens found' };
      }
      
      // Firebase has a limit of 500 tokens per multicast
      const tokenChunks = [];
      for (let i = 0; i < tokens.length; i += 500) {
        tokenChunks.push(tokens.slice(i, i + 500));
      }
      
      let successCount = 0;
      let failureCount = 0;
      
      for (const chunk of tokenChunks) {
        const message = {
          notification: {
            title,
            body
          },
          data: {
            ...data,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          },
          tokens: chunk
        };
        
        // Add image if provided
        if (imageUrl) {
          message.notification.imageUrl = imageUrl;
        }
        
        const response = await admin.messaging().sendMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;
      }
      
      return {
        success: true,
        successCount,
        failureCount
      };
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      throw error;
    }
  }
  
  // Store notification in database
  async storeNotification(notification) {
    try {
      const newNotification = new Notification(notification);
      await newNotification.save();
      return newNotification;
    } catch (error) {
      console.error('Error storing notification:', error);
      throw error;
    }
  }
  
  // Send notification based on user preferences
  async sendNotificationBasedOnPreferences(type, subtype, title, body, data = {}, referenceId = null, referenceModel = null, imageUrl = null) {
    try {
      let users = [];
      
      // Define query based on notification type and subtype
      let query = { [`notificationPreferences.${type}.enabled`]: true };
      
      if (subtype) {
        query[`notificationPreferences.${type}.${subtype}`] = true;
      }
      
      // For news category preferences
      if (type === 'news' && data.category) {
        query[`notificationPreferences.news.categories.${data.category}`] = true;
      }
      
      // Get users based on preferences
      users = await User.find(query);
      const userIds = users.map(user => user._id);
      
      // Store notification in database
      const notification = {
        title,
        body,
        type,
        isGlobal: userIds.length === 0, // If no specific recipients, mark as global
        recipients: userIds.length > 0 ? userIds : undefined,
        imageUrl
      };
      
      // Add reference if provided
      if (referenceId && referenceModel) {
        notification.referenceId = referenceId;
        notification.referenceModel = referenceModel;
      }
      
      const savedNotification = await this.storeNotification(notification);
      
      // Add notification ID to data
      data.notificationId = savedNotification._id.toString();
      
      // If specific users are targeted
      if (users.length > 0) {
        const tokens = users.filter(user => user.fcmToken).map(user => user.fcmToken);
        if (tokens.length > 0) {
          return this.sendFCMToTokens(tokens, title, body, data, imageUrl);
        }
      }
      // Otherwise send to all users (for global notifications)
      else {
        return this.sendNotificationToAllUsers(title, body, data, imageUrl);
      }
      
      return { success: true, notification: savedNotification };
    } catch (error) {
      console.error('Error sending notification based on preferences:', error);
      throw error;
    }
  }
  
  // Helper method to send FCM to multiple tokens
  async sendFCMToTokens(tokens, title, body, data = {}, imageUrl = null) {
    if (tokens.length === 0) {
      return { success: false, message: 'No tokens provided' };
    }
    
    try {
      // Firebase has a limit of 500 tokens per multicast
      const tokenChunks = [];
      for (let i = 0; i < tokens.length; i += 500) {
        tokenChunks.push(tokens.slice(i, i + 500));
      }
      
      let successCount = 0;
      let failureCount = 0;
      
      for (const chunk of tokenChunks) {
        const message = {
          notification: {
            title,
            body
          },
          data: {
            ...data,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          },
          tokens: chunk
        };
        
        // Add image if provided
        if (imageUrl) {
          message.notification.imageUrl = imageUrl;
        }
        
        const response = await admin.messaging().sendMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;
      }
      
      return {
        success: true,
        successCount,
        failureCount
      };
    } catch (error) {
      console.error('Error sending FCM to tokens:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();