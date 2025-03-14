const { sequelize } = require("../config/config");
const User = require("./user.model");

const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log("✅ All models synchronized.");
};

module.exports = { sequelize, syncDB, User };
