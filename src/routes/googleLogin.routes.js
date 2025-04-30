const express = require("express");
const router = express.Router();
const { handleGoogleLogin } = require("../controllers/googleLogin.controller");

router.post("/google-login", handleGoogleLogin);

module.exports = router;
