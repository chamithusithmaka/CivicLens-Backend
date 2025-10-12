const UserFeedback = require('../models/userFeedback');
const User = require('../models/user');

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { promiseId, commentText } = req.body;
    const userId = req.user.userId;

    // Get username from user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const comment = new UserFeedback({
      promiseId,
      userId,
      username: user.fullName,
      commentText,
      reactions: [],
      replies: []
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all comments by promiseId
exports.getCommentsByPromiseId = async (req, res) => {
  try {
    const { promiseId } = req.params;
    const comments = await UserFeedback.find({ promiseId })
      .populate('userId', 'fullName')
      .populate('replies.userId', 'fullName')
      .populate('reactions.userId', 'fullName')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update comment (only by comment owner)
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { commentText } = req.body;
    const userId = req.user.userId;

    const comment = await UserFeedback.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    comment.commentText = commentText;
    comment.updatedAt = new Date();
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete comment (only by comment owner)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await UserFeedback.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await UserFeedback.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add or update reaction to a comment
exports.addReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reactionType } = req.body; // 'like', 'heart', 'angry', 'funny'
    const userId = req.user.userId;

    const comment = await UserFeedback.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user already reacted
    const existingReactionIndex = comment.reactions.findIndex(
      reaction => reaction.userId.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      comment.reactions[existingReactionIndex].reactionType = reactionType;
      comment.reactions[existingReactionIndex].createdAt = new Date();
    } else {
      // Add new reaction
      comment.reactions.push({
        userId,
        reactionType,
        createdAt: new Date()
      });
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove reaction from a comment
exports.removeReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await UserFeedback.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Remove user's reaction
    comment.reactions = comment.reactions.filter(
      reaction => reaction.userId.toString() !== userId
    );

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add reply to a comment
exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { replyText } = req.body;
    const userId = req.user.userId;

    // Get username from user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const comment = await UserFeedback.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.replies.push({
      userId,
      username: user.fullName,
      replyText,
      createdAt: new Date()
    });

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete reply (only by reply owner)
exports.deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user.userId;

    const comment = await UserFeedback.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const replyIndex = comment.replies.findIndex(
      reply => reply._id.toString() === replyId
    );

    if (replyIndex === -1) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Check if user owns the reply
    if (comment.replies[replyIndex].userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own replies' });
    }

    comment.replies.splice(replyIndex, 1);
    await comment.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};