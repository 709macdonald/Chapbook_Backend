// models/File.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const File = sequelize.define("File", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileContent: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  serverKey: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  text: {
    type: DataTypes.TEXT,
  },
  matchedWords: {
    type: DataTypes.TEXT,
    get() {
      const raw = this.getDataValue("matchedWords");
      return raw ? raw.split(",") : [];
    },
    set(val) {
      this.setDataValue(
        "matchedWords",
        Array.isArray(val) ? val.join(",") : val
      );
    },
  },
  locations: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  tags: {
    type: DataTypes.TEXT,
    get() {
      const raw = this.getDataValue("tags");
      return raw ? raw.split(",") : [];
    },
    set(val) {
      this.setDataValue("tags", Array.isArray(val) ? val.join(",") : val);
    },
  },
  UserId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

User.hasMany(File, { foreignKey: "UserId", onDelete: "CASCADE" });
File.belongsTo(User, { foreignKey: "UserId" });

module.exports = File;
