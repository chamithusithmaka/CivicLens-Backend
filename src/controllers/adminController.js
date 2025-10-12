const SupportRequest = require('../models/SupportRequest');

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard/stats
 */
const getAdminDashboardStats = async (req, res) => {
  try {
    // Get open tickets count
    const openTicketsCount = await SupportRequest.countDocuments({ status: 'Open' });
    
    // Get tickets resolved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedTodayCount = await SupportRequest.countDocuments({
      status: 'Resolved',
      updatedAt: { $gte: today }
    });

    // Get total tickets for statistics
    const totalTickets = await SupportRequest.countDocuments();
    
    // Get average response time (in hours)
    const tickets = await SupportRequest.find({ replies: { $exists: true, $ne: [] } });
    let totalResponseTime = 0;
    let respondedTickets = 0;
    
    tickets.forEach(ticket => {
      if (ticket.replies.length > 0) {
        const firstReplyTime = new Date(ticket.replies[0].timestamp);
        const creationTime = new Date(ticket.createdAt);
        const responseTime = (firstReplyTime - creationTime) / (1000 * 60 * 60); // hours
        totalResponseTime += responseTime;
        respondedTickets++;
      }
    });
    
    const averageResponseTime = respondedTickets > 0 
      ? (totalResponseTime / respondedTickets).toFixed(1) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        openTickets: openTicketsCount,
        resolvedToday: resolvedTodayCount,
        totalTickets: totalTickets,
        responseTime: `${averageResponseTime}h`
      }
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: err.message
    });
  }
};

/**
 * Get all support tickets
 * GET /api/admin/support/tickets
 */
const getAllSupportTickets = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tickets = await SupportRequest.find(query)
      .sort({ createdAt: -1 })
      .select('-replies.message');
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    console.error('Error fetching support tickets:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
      error: err.message
    });
  }
};

/**
 * Get resolved tickets
 * GET /api/admin/support/tickets/resolved
 */
const getResolvedTickets = async (req, res) => {
  try {
    const tickets = await SupportRequest.find({
      status: { $in: ['Resolved', 'Closed'] }
    })
    .sort({ updatedAt: -1 })
    .select('-replies.message');
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    console.error('Error fetching resolved tickets:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resolved tickets',
      error: err.message
    });
  }
};

/**
 * Get ticket details
 * GET /api/admin/support/tickets/:ticketId
 */
const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await SupportRequest.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Map replies to add isAdmin field
    const formattedTicket = {
      ...ticket.toObject(),
      replies: ticket.replies.map(reply => ({
        ...reply.toObject(),
        isAdmin: reply.from.toLowerCase().includes('admin') || reply.from.toLowerCase().includes('support')
      }))
    };
    
    res.status(200).json({
      success: true,
      data: formattedTicket
    });
  } catch (err) {
    console.error('Error fetching ticket details:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket details',
      error: err.message
    });
  }
};

/**
 * Update ticket status
 * PUT /api/admin/support/tickets/:ticketId/status
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const ticket = await SupportRequest.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    ticket.status = status;
    ticket.updatedAt = Date.now();
    
    await ticket.save();
    
    res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: ticket
    });
  } catch (err) {
    console.error('Error updating ticket status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: err.message
    });
  }
};

/**
 * Add admin reply to ticket
 * POST /api/admin/support/tickets/:ticketId/reply
 */
const addAdminReply = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }
    
    const ticket = await SupportRequest.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Add admin reply
    ticket.replies.push({
      from: 'Support Team',
      message
    });
    
    // Update status to In Progress if it was Open
    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    
    ticket.updatedAt = Date.now();
    await ticket.save();
    
    // Format the reply to include isAdmin field
    const newReply = {
      ...ticket.replies[ticket.replies.length - 1].toObject(),
      isAdmin: true
    };
    
    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: {
        ticket,
        newReply
      }
    });
  } catch (err) {
    console.error('Error adding admin reply:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: err.message
    });
  }
};

/**
 * Delete a ticket
 * DELETE /api/admin/support/tickets/:ticketId
 */
const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await SupportRequest.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    await SupportRequest.findByIdAndDelete(ticketId);
    
    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
      error: err.message
    });
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllSupportTickets,
  getResolvedTickets,
  getTicketDetails,
  updateTicketStatus,
  addAdminReply,
  deleteTicket
};