const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
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
  // 👇 ADD THIS
  isGuest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

async function syncUserModel() {
  try {
    await User.sync();
    console.log("User model has been synced successfully.");
  } catch (error) {
    console.error("Error syncing the user model:", error);
  }
}

syncUserModel();

module.exports = User;
