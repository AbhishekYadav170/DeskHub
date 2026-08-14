const Ticket = require("../models/Ticket");

// ============================
// Create Ticket
// ============================
const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      category: category || "general",
      priority: priority || "medium",
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating ticket",
    });
  }
};

// ============================
// Get My Tickets
// ============================
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      createdBy: req.user.id,
    })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      count: tickets.length,
      data: {
        tickets,
      },
    });
  } catch (error) {
    console.error("Get My Tickets Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching tickets",
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
};