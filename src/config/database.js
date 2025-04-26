const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE || "user_database",
  process.env.DB_USER || "root",
  process.env.PASSWORD || "YES",
  {
    host: process.env.HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectOptions: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      ssl: {
        require: true,
      },
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
    logging: process.env.NODE_ENV === "test" ? false : false,
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function syncDatabase() {
  try {
    await sequelize.sync({ force: false });
    console.log("Database sync successful.");
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
}

if (process.env.NODE_ENV !== "test") {
  testConnection();
  syncDatabase();
}

module.exports = sequelize;
