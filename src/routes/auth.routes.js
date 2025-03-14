const express = require("express");
const { register, login } = require("../controllers/auth.controllers");
const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Public route (no authentication required)
router.post("/register", register);
router.post("/login", login);

// Protected route (authentication required)
router.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({ message: "This is your protected profile." });
});

module.exports = router;
