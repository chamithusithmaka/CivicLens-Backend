const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Authentication middleware (for protected routes)
const auth = require('../middleware/auth');

// Create user (Sign Up)
router.post('/signup', userController.createUser);

// Login
router.post('/login', userController.loginUser);

// Get logged-in user details
router.get('/me', auth, userController.getLoggedUserDetails);

// Update user details
router.put('/me', auth, userController.updateUserDetails);

// Delete user
router.delete('/me', auth, userController.deleteUser);

// Update FCM token
router.put('/me/fcm-token', auth, userController.updateFcmToken);

module.exports = router;