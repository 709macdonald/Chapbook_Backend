const File = require("../models/File");
const jwt = require("jsonwebtoken");

// Create a new file entry
const createFile = async (req, res) => {
  try {
    const {
      name,
      fileUrl,
      serverKey,
      type,
      date,
      text,
      matchedWords,
      locations,
      tags,
      UserId, // 👈 Add this
    } = req.body;

    if (!UserId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Optional: prevent duplicate file per user by name+text
    const existing = await File.findOne({ where: { name, text, UserId } });
    if (existing) {
      return res.status(409).json({ error: "Duplicate file (name + content)" });
    }

    const newFile = await File.create({
      name,
      fileUrl,
      serverKey,
      type,
      date,
      text,
      matchedWords,
      locations:
        typeof locations === "string" ? JSON.parse(locations) : locations,
      tags,
      UserId,
    });

    return res.status(201).json(newFile);
  } catch (error) {
    console.error("Error creating file:", error);
    return res.status(500).json({ error: "Failed to create file" });
  }
};

// Get all files
const getAllFiles = async (req, res) => {
  console.log("✅ getAllFiles triggered");
  try {
    const files = await File.findAll({ order: [["date", "DESC"]] });
    return res.status(200).json(files);
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    return res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Get file by ID
const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({ error: "Failed to fetch file" });
  }
};

// Update file
const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const file = await File.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    await file.update(updates);

    return res.status(200).json(file);
  } catch (error) {
    console.error("Error updating file:", error);
    return res.status(500).json({ error: "Failed to update file" });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    await file.destroy();

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
};

const deleteAllFiles = async (req, res) => {
  try {
    await File.destroy({ where: {} }); // deletes all records
    res.status(200).json({ message: "All files deleted successfully" });
  } catch (err) {
    console.error("Error deleting all files:", err);
    res.status(500).json({ error: "Failed to delete all files" });
  }
};

const resetUserFiles = async (req, res) => {
  const { userId } = req.params;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await File.destroy({ where: { UserId: userId } });
    res.status(200).json({ message: "All user files deleted successfully" });
  } catch (err) {
    console.error("Error deleting user files:", err);
    res.status(500).json({ error: "Failed to delete user files" });
  }
};

module.exports = {
  createFile,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile,
  deleteAllFiles,
  resetUserFiles,
};
