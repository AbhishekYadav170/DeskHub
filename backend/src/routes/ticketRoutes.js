const express = require("express");

const protect = require("../middlewere/authMiddlewere");
const authorizeRoles = require("../middlewere/roleMiddlewere");

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  assignTicket,
  updateTicketStatus,
  getTicketById,
  getAssignedTickets,
  reopenTicket,
} = require("../controllers/ticketController");

const router = express.Router();


// Customer - Create Ticket
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createTicket
);


// Customer - Get My Tickets
router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyTickets
);


// ============================
// Agent - Get All Tickets
// ============================
router.get(
  "/",
  protect,
  authorizeRoles("agent"),
  getAllTickets
);

// ============================
// Agent - Get Assigned Tickets
// ============================

router.get(
  "/assigned",
  protect,
  authorizeRoles("agent"),
  getAssignedTickets
);


// ============================
// Agent - Assign Ticket
// ============================
router.patch(
  "/:ticketId/assign",
  protect,
  authorizeRoles("agent"),
  assignTicket
);

// ============================
// Agent - Update Ticket Status
// ============================
router.patch(
  "/:ticketId/status",
  protect,
  authorizeRoles("agent"),
  updateTicketStatus
);

// ============================
// Get Single Ticket
// ============================
router.get(
  "/:ticketId",
  protect,
  getTicketById
);

// ============================
// Customer - Reopen Ticket
// ============================
router.patch(
  "/:ticketId/reopen",
  protect,
  authorizeRoles("customer"),
  reopenTicket
);


module.exports = router;