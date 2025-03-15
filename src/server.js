const express = require("express");
const sequelize = require("./config/database");
const User = require("./models/user");

const app = express();
const port = 5005;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

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
