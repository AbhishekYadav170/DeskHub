const express = require("express");
const protect = require("../middlewere/authMiddlewere");

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const router = express.Router();

// Register / Signup
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// get-me
router.get("/me", protect, getMe);

module.exports = router;