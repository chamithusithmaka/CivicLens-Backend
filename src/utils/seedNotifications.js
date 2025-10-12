const Notification = require('../models/notification');
const User = require('../models/user');
const mongoose = require('mongoose');

const seedNotifications = async () => {
  try {
    console.log('Seeding notifications as part of the main seed process...');
    
    // Check connection state before proceeding
    if (mongoose.connection.readyState !== 1) {
      console.error(`MongoDB connection not ready. Current state: ${mongoose.connection.readyState}`);
      throw new Error(`MongoDB connection is not ready. Current state: ${mongoose.connection.readyState}`);
    }
    
    // Check if we already have notifications
    const notificationCount = await Notification.countDocuments();
    
    if (notificationCount > 0) {
      console.log(`Found ${notificationCount} existing notifications, skipping seed.`);
      return;
    }

    // Get some user IDs if available (or use dummy IDs if not)
    let userIds = [];
    try {
      const users = await User.find().limit(5);
      
      if (users.length > 0) {
        console.log(`Found ${users.length} users for notification targeting`);
        userIds = users.map(user => user._id);
      } else {
        console.log('No users found, creating dummy user IDs');
        userIds = [
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId()
        ];
      }
    } catch (userError) {
      console.error('Error fetching users:', userError);
      console.log('Using dummy user IDs instead');
      userIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ];
    }

    // Sample notification data
    const notifications = [
      {
        title: 'Upcoming Election',
        body: 'Parliamentary elections will be held next month',
        type: 'election',
        recipients: userIds.length > 0 ? [userIds[0]] : [],
        isGlobal: true,
        createdAt: new Date()
      },
      {
        title: 'New Policy Announcement',
        body: 'Government has announced a new economic policy',
        type: 'news',
        recipients: userIds.length > 1 ? [userIds[1]] : [],
        isGlobal: true,
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        title: 'Promise Update',
        body: 'Prime Minister has fulfilled the infrastructure development promise',
        type: 'promise',
        recipients: userIds.length > 0 ? [userIds[0]] : [],
        isGlobal: false,
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        title: 'Election Fact',
        body: 'Did you know? The 2019 Presidential election had over 80% voter turnout!',
        type: 'electionFact',
        recipients: userIds.length > 2 ? [userIds[2]] : [],
        isGlobal: true,
        createdAt: new Date(Date.now() - 259200000) // 3 days ago
      },
      {
        title: 'Ministry Performance Report',
        body: 'Ministry of Finance has released its quarterly performance report',
        type: 'ministry',
        recipients: userIds.length > 1 ? [userIds[1]] : [],
        isGlobal: true,
        createdAt: new Date(Date.now() - 345600000) // 4 days ago
      }
    ];

    // Insert notifications
    console.log('Inserting notifications...');
    const result = await Notification.insertMany(notifications);
    console.log(`Successfully seeded ${result.length} notifications!`);
    
    return result;
  } catch (error) {
    console.error('Error seeding notifications:', error);
    throw error; // Re-throw to be caught by the main seeder
  }
};

module.exports = { seedNotifications };