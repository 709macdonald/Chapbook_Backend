// routes/file.routes.js
const express = require("express");
const router = express.Router();
const { File } = require("../models");

// Save new file
router.post("/files", async (req, res) => {
  try {
    const file = await File.create(req.body);
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to save file." });
  }
});

// Get user's files
router.get("/files", async (req, res) => {
  const { userId } = req.query;
  try {
    const files = await File.findAll({ where: { userId } });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files." });
  }
});

// Delete a file
router.delete("/files/:id", async (req, res) => {
  try {
    await File.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file." });
  }
});

module.exports = router;
