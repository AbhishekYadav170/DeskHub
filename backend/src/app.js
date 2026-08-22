const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const replyRoutes = require("./routes/replyRoutes");

const app = express();


// Security
app.use(helmet());


// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Cookies
app.use(cookieParser());


// Request logger
app.use(morgan("dev"));


// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DeskHub Backend is running successfully 🚀",
  });
});


// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/replies", replyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;