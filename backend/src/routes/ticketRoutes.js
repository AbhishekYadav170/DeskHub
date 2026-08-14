const express = require("express");

const protect = require("../middlewere/authMiddlewere");
const authorizeRoles = require("../middlewere/roleMiddlewere");

const {
  createTicket,
  getMyTickets,
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

module.exports = router;