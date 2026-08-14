const express = require("express");

const protect = require("../middlewere/authMiddlewere");
const authorizeRoles = require("../middlewere/roleMiddlewere");

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  assignTicket
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
// Agent - Assign Ticket
// ============================
router.patch(
  "/:ticketId/assign",
  protect,
  authorizeRoles("agent"),
  assignTicket
);


module.exports = router;