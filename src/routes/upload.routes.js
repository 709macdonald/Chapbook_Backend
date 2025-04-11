const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller.js");
const upload = require("../middleware/multer.middleware"); // Switches based on USE_S3

// Unified Upload Route
router.post("/upload", upload.array("files", 10), uploadController.uploadFiles);
router.get("/signed-url/:key", uploadController.getSignedUrl);

// Local delete only — doesn't work for S3
router.delete("/delete-local/:filename", uploadController.deleteFile);

module.exports = router;
