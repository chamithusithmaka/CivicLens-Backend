require('dotenv').config({ path: __dirname + '/.env' });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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
