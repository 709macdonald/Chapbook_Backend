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

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    console.error("❌ Error in /me:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
