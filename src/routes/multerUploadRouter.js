const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload-local", upload.array("files", 10), (req, res) => {
  console.log("📦 Received files:", req.files);

  const uploadedFiles = req.files.map((file) => ({
    url: `http://localhost:5005/uploads/${file.filename}`,
    name: file.originalname,
    key: file.filename,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }));

  res.status(200).json(uploadedFiles);
});

module.exports = router;
