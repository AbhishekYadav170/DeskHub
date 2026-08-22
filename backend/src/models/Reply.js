const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Reply message is required"],
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },

    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;