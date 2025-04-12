const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// EDIT USERS TABLE ROUTER
router.post("/users", userController.createUser);
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
const authMiddleware = require("../middleware/auth.middleware");

//LOGIN ROUTER
router.post("/login", userController.loginUser);
router.get("/profile", authMiddleware, userController.getProfile);
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId); // ← from middleware
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    console.error("❌ Error in /me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
