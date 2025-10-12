require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/notification');
const User = require('../models/user');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civiclens';

async function seedNotificationsOnly() {
  let connection = null;
  
  try {
    console.log('Connecting to MongoDB for notifications seeding...');
    connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected. Connection state:', mongoose.connection.readyState);
    
    // Check if we already have notifications
    const notificationCount = await Notification.countDocuments();
    console.log(`Found ${notificationCount} existing notifications`);
    
    if (notificationCount > 0) {
      console.log('Notifications already exist. Skipping seeding.');
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
      },
      {
        title: 'Welcome to CivicLens',
        body: 'Thank you for joining CivicLens. Stay updated with the latest political developments.',
        type: 'system',
        recipients: userIds,
        isGlobal: false,
        createdAt: new Date(Date.now() - 432000000) // 5 days ago
      }
    ];

    // Insert notifications
    console.log('Inserting notifications...');
    const result = await Notification.insertMany(notifications);
    console.log(`Successfully seeded ${result.length} notifications!`);
    
    return result;
  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    // Close connection
    if (connection) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// Run the seeder if this script is executed directly
if (require.main === module) {
  seedNotificationsOnly()
    .then(() => {
      console.log('Notification seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error in notification seeding script:', error);
      process.exit(1);
    });
}

// Export for use in other scripts
module.exports = { seedNotificationsOnly };