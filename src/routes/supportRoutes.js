const express = require('express');
const {
  submitSupportRequest,
  getUserSupportRequests,
  getSupportRequestDetails,
  addReplyToSupportRequest,
  updateSupportRequestStatus
} = require('../controllers/supportController');

const router = express.Router();

// Submit a new support request
router.post('/request', submitSupportRequest);

// Get all support requests for a user
router.get('/user/:userId', getUserSupportRequests);

// Get support request details
router.get('/request/:ticketId', getSupportRequestDetails);

// Add a reply to a support request
router.post('/request/:ticketId/reply', addReplyToSupportRequest);

// Update support request status
router.put('/request/:ticketId/status', updateSupportRequestStatus);

module.exports = router;