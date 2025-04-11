const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller.js");
const upload = require("../config/multer.config");

// LOCAL UPLOAD ROUTE
router.post(
  "/upload-local",
  upload.array("files", 10),
  uploadController.uploadFiles
);

// DELETE FILE ROUTE
router.delete("/delete-local/:filename", uploadController.deleteFile);

module.exports = router;
