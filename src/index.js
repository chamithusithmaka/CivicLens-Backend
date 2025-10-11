require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const promiseRoutes = require('./routes/promiseRoutes');
app.use('/promise/api', promiseRoutes);

const ministryGrowthNewsRoutes = require('./routes/ministryGrowthNewsRoutes');
app.use('/promise/api', ministryGrowthNewsRoutes);

const ministryPerformanceRoutes = require('./routes/ministryPerformanceRoutes');
app.use('/promise/api', ministryPerformanceRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/promise/api', userRoutes);

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
