const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller.js");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../config/multer.config");

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
router.post(
  "/delete-multiple-s3",
  authMiddleware,
  uploadController.deleteAllUserFilesFromS3
);

module.exports = router;
