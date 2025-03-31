const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// EDIT USERS TABLE ROUTER
router.post("/users", userController.createUser);
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

//LOGIN ROUTER
router.post("/login", userController.loginUser);
router.get("/profile", userController.getProfile);

module.exports = router;
