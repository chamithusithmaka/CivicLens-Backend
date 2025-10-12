require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes/userRoutes');
const promiseRoutes = require('./routes/promiseRoutes');
const ministryPerformanceRoutes = require('./routes/ministryPerformanceRoutes');
const ministryGrowthNewsRoutes = require('./routes/ministryGrowthNewsRoutes');
const newsRoutes = require('./routes/newsRoutes');
const electionRoutes = require('./routes/electionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/promises', promiseRoutes);
app.use('/api/ministry-performances', ministryPerformanceRoutes);
app.use('/api/ministry-growth-news', ministryGrowthNewsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/notifications', notificationRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('Politician Tracker Backend is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
