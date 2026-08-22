const express = require("express");

const protect = require("../middlewere/authMiddlewere");

const {
  createReply,
  getReplies,
} = require("../controllers/replyController");

const router = express.Router();

// Add Reply
router.post(
  "/:ticketId",
  protect,
  createReply
);

// Get Ticket Replies
router.get(
  "/:ticketId",
  protect,
  getReplies
);

module.exports = router;