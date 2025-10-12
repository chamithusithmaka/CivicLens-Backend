const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new user (Sign Up)
exports.createUser = async (req, res) => {
  try {
    const { name, fullName, email, phoneNumber, nic, password, district, profilePicture, fcmToken } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }, { nic }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with provided email, phone number, or NIC.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name || fullName, // Accept either name or fullName
      email,
      phoneNumber,
      nic,
      password: hashedPassword,
      district,
      profileImage: profilePicture, // Map profilePicture to profileImage
      fcmToken // Save FCM token if provided
    });

    await user.save();
    res.status(201).json({ 
      message: 'User created successfully', 
      user: { 
        name: user.name, 
        email, 
        phoneNumber, 
        nic 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login API
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email, phoneNumber: user.phoneNumber, nic: user.nic }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get logged-in user details (requires authentication middleware)
exports.getLoggedUserDetails = async (req, res) => {
  try {
    const userId = req.user.userId; // req.user set by auth middleware
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user details
exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // If profileImage is present, it will be a base64 string from frontend
    // No extra processing needed, just save it
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId; // req.user set by auth middleware
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Also add a specific endpoint for updating FCM token
exports.updateFcmToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }
    
    const user = await User.findByIdAndUpdate(userId, 
      { fcmToken }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'FCM token updated successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};