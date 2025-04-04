const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const authMiddleware = require("../middleware/auth.middleware"); // Adjust path as needed

// Apply auth middleware to all file routes
router.use(authMiddleware);

// FILE CRUD ROUTES
router.post("/files", fileController.createFile);
router.get("/files", fileController.getAllFiles);
router.get("/files/:id", fileController.getFileById);
router.put("/files/:id", fileController.updateFile);
router.delete("/files/:id", fileController.deleteFile);
router.delete("/files", fileController.deleteAllFiles);
router.delete("/files/reset/:userId", fileController.resetUserFiles);

module.exports = router;
