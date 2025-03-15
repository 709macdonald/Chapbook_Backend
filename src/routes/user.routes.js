const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Define the POST route to create a user
router.post("/users", userController.createUser);

module.exports = router;
