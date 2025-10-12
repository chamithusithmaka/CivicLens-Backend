require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const roleRoutes = require("./routes/roleRoutes");
const partyRoutes = require("./routes/partyRoutes");
const politicianRoutes = require("./routes/politicianRoutes");
const questionRoutes = require('./routes/questionRoutes');
const commonRoutes = require('./routes/common');
const performanceRoutes = require('./routes/performanceRoutes');
const polibotRoutes = require('./routes/polibot');
const polibotAiRoutes = require('./routes/polibot-ai');
const geminiQuizRoutes = require('./routes/geminiQuizRoutes');
const quizHistoryRoutes = require('./routes/quizHistoryRoutes');
const supportRoutes = require('./routes/supportRoutes'); // Add this line
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const electionRoutes = require('./routes/electionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/admin', adminRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/politicians", politicianRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/polibot', polibotRoutes);
app.use('/api/polibot-ai', polibotAiRoutes);
app.use('/api/quiz', geminiQuizRoutes);
app.use('/api/quiz/history', quizHistoryRoutes);
app.use('/api/support', supportRoutes); // Add this line

const promiseRoutes = require('./routes/promiseRoutes');
app.use('/promise/api', promiseRoutes);

const ministryGrowthNewsRoutes = require('./routes/ministryGrowthNewsRoutes');
app.use('/promise/api', ministryGrowthNewsRoutes);

const ministryPerformanceRoutes = require('./routes/ministryPerformanceRoutes');
app.use('/promise/api', ministryPerformanceRoutes);



// Use routes
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/notifications', notificationRoutes);

const userFeedbackRoutes = require('./routes/userFeedbackRoutes');
app.use('/promise/api', userFeedbackRoutes);

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
