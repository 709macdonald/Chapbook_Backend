const app = require("./app");
const sequelize = require("./config/database");

const port = 5005;

sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to sync database:", error);
  });
