// src/server.js
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/models/config");
const authRoutes = require("./src/routes/auth.routes");

const app = express();

app.use(express.json()); // For parsing JSON data
app.use(cors()); // To allow cross-origin requests

// Database connection
connectDB();

// Routes setup
app.use("/api/auth", authRoutes); // Prefix your authentication routes with '/api/auth'

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
