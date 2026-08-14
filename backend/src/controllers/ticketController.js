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

// ============================
// Get All Tickets - Agent
// ============================
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All tickets fetched successfully",
      count: tickets.length,
      data: {
        tickets,
      },
    });
  } catch (error) {
    console.error("Get All Tickets Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching all tickets",
    });
  }
};

// ============================
// Assign Ticket - Agent
// ============================
const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Logged-in agent ko ticket assign karo
    ticket.assignedTo = req.user.id;

    // Assignment ke baad status update
    if (ticket.status === "open") {
      ticket.status = "in-progress";
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: {
        ticket: updatedTicket,
      },
    });
  } catch (error) {
    console.error("Assign Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while assigning ticket",
    });
  }
};

// ============================
// Update Ticket Status - Agent
// ============================
const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "open",
      "in-progress",
      "resolved",
      "closed",
    ];

    // Validate status
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use: open, in-progress, resolved, or closed",
      });
    }

    // Find ticket
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Update status
    ticket.status = status;

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: {
        ticket: updatedTicket,
      },
    });
  } catch (error) {
    console.error("Update Ticket Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating ticket status",
    });
  }
};


// ============================
// Get Single Ticket
// ============================
const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error("Get Ticket By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching ticket",
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  assignTicket,
  updateTicketStatus,
  getTicketById,
};