require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase } = require('../utils/seedDatabase');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civiclens';

(async function runSeeder() {
  let connection = null;
  
  try {
    // Clean up any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Closed existing MongoDB connections');
    }
    
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB connected successfully. Connection state: ${mongoose.connection.readyState}`);
    
    // Wait a moment to ensure connection is fully established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run the seeder
    console.log('Starting database seeding...');
    await seedDatabase();
    console.log('All seeding operations completed successfully!');
  } catch (err) {
    console.error('Seeder error:', err);
    process.exit(1);
  } finally {
    try {
      // Only close if we have an open connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('Database connection closed');
      }
    } catch (closeErr) {
      console.error('Error closing database connection:', closeErr);
    }
    process.exit(0);
  }
})();