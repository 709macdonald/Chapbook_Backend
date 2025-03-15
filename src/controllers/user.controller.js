const User = require("../models/user");

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Create user (the password will be hashed automatically by the model)
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // the password will be hashed automatically before saving
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};

module.exports = {
  createUser,
};
