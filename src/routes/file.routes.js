const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");

// FILE CRUD ROUTES
router.post("/files", fileController.createFile);
router.get("/files", fileController.getAllFiles);
router.get("/files/:id", fileController.getFileById);
router.put("/files/:id", fileController.updateFile);
router.delete("/files/:id", fileController.deleteFile);
router.delete("/files", fileController.deleteAllFiles); // DELETE /api/files
router.delete("/files/reset/:userId", fileController.resetUserFiles);

module.exports = router;
