const express = require('express');
const router = express.Router();
const userFeedbackController = require('../controllers/userFeedbackController');
const auth = require('../middleware/auth'); // Authentication middleware

// Create a new comment
router.post('/comments', auth, userFeedbackController.createComment);

// Get all comments by promiseId
router.get('/comments/promise/:promiseId', userFeedbackController.getCommentsByPromiseId);

// Update comment (only by comment owner)
router.put('/comments/:commentId', auth, userFeedbackController.updateComment);

// Delete comment (only by comment owner)
router.delete('/comments/:commentId', auth, userFeedbackController.deleteComment);

// Add or update reaction to a comment
router.post('/comments/:commentId/reactions', auth, userFeedbackController.addReaction);

// Remove reaction from a comment
router.delete('/comments/:commentId/reactions', auth, userFeedbackController.removeReaction);

// Add reply to a comment
router.post('/comments/:commentId/replies', auth, userFeedbackController.addReply);

// Delete reply (only by reply owner)
router.delete('/comments/:commentId/replies/:replyId', auth, userFeedbackController.deleteReply);

module.exports = router;