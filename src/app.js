// src/app.js
const express = require("express");
const userRoutes = require("./routes/user.routes");
const app = express();

app.use(express.json());
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
