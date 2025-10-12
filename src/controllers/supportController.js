const SupportRequest = require('../models/SupportRequest');
const { sendSupportRequestConfirmation, sendSupportRequestNotification } = require('../utils/emailService');

/**
 * Submit a new support request
 * POST /api/support/request
 */
const submitSupportRequest = async (req, res) => {
  try {
    const { userId, username, email, subject, message, category } = req.body;

    // Create new support request
    const supportRequest = new SupportRequest({
      userId,
      username,
      email,
      subject,
      message,
      category: category || 'General Inquiry'
    });

    // Save to database
    await supportRequest.save();

    // Send confirmation email to user
    const userEmailResult = await sendSupportRequestConfirmation(
      email,
      username,
      supportRequest._id,
      subject
    );

    // Send notification email to support team
    const supportEmailResult = await sendSupportRequestNotification(supportRequest);

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully',
      ticketId: supportRequest._id,
      emailStatus: {
        userEmail: userEmailResult,
        supportEmail: supportEmailResult
      }
    });
  } catch (err) {
    console.error('Error submitting support request:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit support request',
      error: err.message
    });
  }
};

/**
 * Get support requests for a user
 * GET /api/support/user/:userId
 */
const getUserSupportRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const supportRequests = await SupportRequest.find({ userId })
      .sort({ createdAt: -1 })
      .select('-attachments');

    res.status(200).json({
      success: true,
      count: supportRequests.length,
      data: supportRequests
    });
  } catch (err) {
    console.error('Error fetching user support requests:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support requests',
      error: err.message
    });
  }
};

/**
 * Get support request details by ID
 * GET /api/support/request/:ticketId
 */
const getSupportRequestDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const supportRequest = await SupportRequest.findById(ticketId);

    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: supportRequest
    });
  } catch (err) {
    console.error('Error fetching support request details:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support request details',
      error: err.message
    });
  }
};

/**
 * Add a reply to an existing support request
 * POST /api/support/request/:ticketId/reply
 */
const addReplyToSupportRequest = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { from, message } = req.body;

    if (!from || !message) {
      return res.status(400).json({
        success: false,
        message: 'From and message fields are required'
      });
    }

    const supportRequest = await SupportRequest.findById(ticketId);

    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found'
      });
    }

    // Add reply
    supportRequest.replies.push({
      from,
      message
    });

    // Update the status to In Progress if it was Open
    if (supportRequest.status === 'Open') {
      supportRequest.status = 'In Progress';
    }

    supportRequest.updatedAt = Date.now();
    await supportRequest.save();

    // TODO: Send email notifications about the new reply

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: supportRequest
    });
  } catch (err) {
    console.error('Error adding reply to support request:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: err.message
    });
  }
};

/**
 * Update support request status
 * PUT /api/support/request/:ticketId/status
 */
const updateSupportRequestStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const supportRequest = await SupportRequest.findById(ticketId);

    if (!supportRequest) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found'
      });
    }

    supportRequest.status = status;
    supportRequest.updatedAt = Date.now();
    await supportRequest.save();

    // TODO: Send email notifications about status change

    res.status(200).json({
      success: true,
      message: `Support request status updated to ${status}`,
      data: supportRequest
    });
  } catch (err) {
    console.error('Error updating support request status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: err.message
    });
  }
};

module.exports = {
  submitSupportRequest,
  getUserSupportRequests,
  getSupportRequestDetails,
  addReplyToSupportRequest,
  updateSupportRequestStatus
};