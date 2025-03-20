const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("user_database", "root", "YES", {
  host: "localhost",
  dialect: "mysql",
  dialectOptions: {
    charset: "utf8mb4",
  },
  logging: false,
});

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
    // Sync all defined models to the database
    await sequelize.sync({ force: false }); // 'force: true' will drop the table each time
    console.log("Database sync successful.");
  } catch (error) {
    console.error("Unable to sync the database:", error);
  }
}

testConnection();
syncDatabase();

module.exports = sequelize;
