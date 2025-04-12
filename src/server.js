const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const userRoutes = require("./routes/user.routes");
const fileRoutes = require("./routes/file.routes");
const uploadRoutes = require("./routes/upload.routes");
const aiRoutes = require("./routes/ai.routes");
const sequelize = require("./config/database");

const requiredS3Vars = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
];

const app = express();
const port = 5005;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-uploadthing-version",
      "x-uploadthing-package",
      "x-auth-token",
    ],
  })
);

app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", fileRoutes);
app.use("/api/ai", aiRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`S3 Upload endpoint: http://localhost:${port}/api/upload`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

startServer();
