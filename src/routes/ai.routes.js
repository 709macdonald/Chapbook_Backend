const express = require("express");
const router = express.Router();
const { generateResponse } = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/generate", authMiddleware, generateResponse);

module.exports = router;
