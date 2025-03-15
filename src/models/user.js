const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

// Define the User model
const User = sequelize.define("User", {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(), // Generates a UUID v4 by default
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Before creating or updating a user, hash the password
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10); // Generate a salt for bcrypt
  user.password = await bcrypt.hash(user.password, salt); // Hash the password
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Sync the model with the database
async function syncUserModel() {
  try {
    await User.sync(); // This will create the table if it doesn't exist
    console.log("User model has been synced successfully.");
  } catch (error) {
    console.error("Error syncing the user model:", error);
  }
}

syncUserModel();

module.exports = User;
