const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller.js");
const upload = require("../middleware/multer.middleware");

// File upload route (S3 only)
router.post("/upload", upload.array("files", 10), uploadController.uploadFiles);

// Get signed URL for S3 file access
router.get("/signed-url/:key", uploadController.getSignedUrl);

// Delete from S3 - using the original function name
router.delete("/delete-local/:filename", uploadController.deleteFile);

module.exports = router;
