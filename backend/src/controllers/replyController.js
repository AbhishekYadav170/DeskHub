const Reply = require("../models/Reply");
const Ticket = require("../models/Ticket");

// ============================
// Create Reply
// ============================
const createReply = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Closed ticket par reply allowed nahi hai
    if (ticket.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Cannot reply to a closed ticket",
      });
    }

    const reply = await Reply.create({
      message: message.trim(),
      ticket: ticketId,
      user: req.user.id,
    });

    const populatedReply = await Reply.findById(reply._id).populate(
      "user",
      "name email role",
    );

    return res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: {
        reply: populatedReply,
      },
    });
  } catch (error) {
    console.error("Create Reply Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while adding reply",
    });
  }
};

// ============================
// Get Ticket Replies
// ============================
const getReplies = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const replies = await Reply.find({
      ticket: ticketId,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Replies fetched successfully",
      count: replies.length,
      data: {
        replies,
      },
    });
  } catch (error) {
    console.error("Get Replies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching replies",
    });
  }
};

module.exports = {
  createReply,
  getReplies,
};
