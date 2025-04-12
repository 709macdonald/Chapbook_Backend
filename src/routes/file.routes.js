const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/files", authMiddleware, fileController.createFile);
router.get("/files", authMiddleware, fileController.getAllFiles);
router.get("/files/:id", authMiddleware, fileController.getFileById);
router.put("/files/:id", authMiddleware, fileController.updateFile);
router.delete("/files/:id", authMiddleware, fileController.deleteFile);
router.delete("/files", authMiddleware, fileController.deleteAllFiles);
router.delete(
  "/files/reset/:userId",
  authMiddleware,
  fileController.resetUserFiles
);

module.exports = router;
