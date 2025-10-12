const express = require('express');
const {
  getAdminDashboardStats,
  getAllSupportTickets,
  getTicketDetails,
  updateTicketStatus,
  addAdminReply,
  getResolvedTickets,
  deleteTicket
} = require('../controllers/adminController');

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', getAdminDashboardStats);

// Support tickets
router.get('/support/tickets', getAllSupportTickets);
router.get('/support/tickets/resolved', getResolvedTickets);
router.get('/support/tickets/:ticketId', getTicketDetails);
router.put('/support/tickets/:ticketId/status', updateTicketStatus);
router.post('/support/tickets/:ticketId/reply', addAdminReply);
router.delete('/support/tickets/:ticketId', deleteTicket);

module.exports = router;