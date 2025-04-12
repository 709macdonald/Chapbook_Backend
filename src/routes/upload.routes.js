const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller.js");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/upload",
  authMiddleware,
  upload.array("files", 10),
  uploadController.uploadFiles
);
router.get("/signed-url/:key", authMiddleware, uploadController.getSignedUrl);
router.delete(
  "/delete-local/:filename",
  authMiddleware,
  uploadController.deleteFile
);

module.exports = router;
