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
const googleLoginRoutes = require("./routes/googleLogin.routes");

const requiredS3Vars = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
];

const app = express();
const port = process.env.PORT || 5005;

const allowedOrigins = [
  "http://localhost:5173",
  "https://chapbook-react-app-rb24.vercel.app",
  "https://chapbook-react-app.vercel.app",
  "https://chapbook-react-app-git-main-peter-macdonalds-projects.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // 🎯 send back the correct origin
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-uploadthing-version",
    "x-uploadthing-package",
    "x-auth-token",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight

app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", fileRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", googleLoginRoutes);

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
