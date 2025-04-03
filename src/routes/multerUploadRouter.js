const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Make sure the uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

router.post("/upload-local", upload.array("files", 10), (req, res) => {
  const uploadedFiles = req.files.map((file) => ({
    fileUrl: `http://localhost:5005/uploads/${file.filename}`,
    name: file.originalname,
    key: file.filename,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }));

  console.log("📁 Uploaded locally:", uploadedFiles);
  res.json(uploadedFiles);
});

module.exports = router;
