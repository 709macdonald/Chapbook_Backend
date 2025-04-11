const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

const uploadFiles = (req, res) => {
  try {
    const uploadedFiles = req.files.map((file) => ({
      fileUrl: `http://localhost:5005/uploads/${file.filename}`,
      name: file.originalname,
      key: file.filename,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    console.log("📁 Uploaded locally:", uploadedFiles);
    return res.json(uploadedFiles);
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
};

const deleteFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("❌ Error deleting file:", err);
      return res.status(500).json({ error: "File deletion failed" });
    }
    console.log("✅ Successfully deleted file:", filename);
    return res.json({ message: "File deleted successfully" });
  });
};

module.exports = {
  uploadFiles,
  deleteFile,
};
