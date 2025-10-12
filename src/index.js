require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//import routes
const roleRoutes = require("./routes/roleRoutes");
const partyRoutes = require("./routes/partyRoutes");
const politicianRoutes = require("./routes/politicianRoutes");
const levelRoutes = require("./routes/levelRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes

app.use("/api/roles", roleRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/politicians", politicianRoutes);
app.use("/api/levels", levelRoutes);


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
