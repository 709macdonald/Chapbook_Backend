// src/app.js
const express = require("express");
const userRoutes = require("./routes/user.routes");
const app = express();
const { createUploadthingExpressHandler } = require("uploadthing/express");
const { uploadRouter } = require("./routes/uploadRouter");

app.use(express.json());
app.use("/api", userRoutes);
app.use(
  "/api/uploadthing",
  createUploadthingExpressHandler({ router: uploadRouter })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
