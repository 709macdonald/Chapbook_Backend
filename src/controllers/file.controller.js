const { File } = require("../models/File");

// Create a new file entry
const createFile = async (req, res) => {
  try {
    const {
      name,
      fileUrl,
      serverKey,
      type,
      text,
      matchedWords,
      locations,
      tags,
    } = req.body;

    const file = await File.create({
      name,
      fileUrl,
      serverKey,
      type,
      text,
      matchedWords,
      locations,
      tags,
    });

    return res.status(201).json(file);
  } catch (error) {
    console.error("Error creating file:", error);
    return res.status(500).json({ error: "Failed to create file" });
  }
};

// Get all files
const getAllFiles = async (req, res) => {
  try {
    const files = await File.findAll({ order: [["date", "DESC"]] });
    return res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
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

module.exports = {
  createFile,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile,
};
