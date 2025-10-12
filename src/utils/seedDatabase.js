const mongoose = require('mongoose');
const User = require('../models/user');
const Election = require('../models/election');
const News = require('../models/news');
const Notification = require('../models/notification');

// Import the seed functions
const { seedElections } = require('./seedElections');
const { seedNews } = require('./seedNews');
const { seedNotifications } = require('./seedNotifications');

const seedDatabase = async () => {
  console.log('Starting database seeding process...');
  
  // Check connection state at the beginning
  console.log(`Initial MongoDB connection state: ${mongoose.connection.readyState}`);
  
  // Only proceed if connection is ready
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB connection is not ready. Cannot proceed with seeding.');
    throw new Error(`MongoDB connection is not ready. Current state: ${mongoose.connection.readyState}`);
  }
  
  let completedSeeders = [];
  
  try {
    // 1. Seed Elections
    try {
      console.log('Running elections seeder...');
      await seedElections();
      console.log('Elections seeded successfully.');
      completedSeeders.push('elections');
    } catch (electionError) {
      console.error('Error seeding elections:', electionError);
      // Continue with other seeders
    }

    // 2. Seed News
    try {
      console.log('Running news seeder...');
      await seedNews();
      console.log('News seeded successfully.');
      completedSeeders.push('news');
    } catch (newsError) {
      console.error('Error seeding news:', newsError);
      // Continue with other seeders
    }

    // Check connection state before notifications
    if (mongoose.connection.readyState !== 1) {
      console.error(`MongoDB connection state before notifications: ${mongoose.connection.readyState}`);
      throw new Error(`MongoDB connection is not ready. Current state: ${mongoose.connection.readyState}`);
    }

    // 3. Seed Notifications - this should be last to reference other entities
    try {
      console.log('Running notifications seeder...');
      await seedNotifications();
      console.log('Notifications seeded successfully.');
      completedSeeders.push('notifications');
    } catch (notificationError) {
      console.error('Error seeding notifications:', notificationError);
    }

    console.log(`Database seeding completed for: ${completedSeeders.join(', ')}`);
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = { seedDatabase };