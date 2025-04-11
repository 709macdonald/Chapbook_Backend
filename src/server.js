const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Load .env before using any config
dotenv.config();

const userRoutes = require("./routes/user.routes");
const fileRoutes = require("./routes/file.routes");
const uploadRoutes = require("./routes/upload.routes");
const aiRoutes = require("./routes/ai.routes");
const sequelize = require("./config/database");

// Check required S3 environment variables
const requiredS3Vars = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
];

requiredS3Vars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    console.error("S3 storage will not work properly without this variable.");
  } else {
    console.log(`✅ ${varName} configured`);
  }
});

const app = express();
const port = 5005;

// ✅ CORS setup
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

// ✅ Route setup
app.use("/api", userRoutes);
app.use("/api", uploadRoutes); // now exclusively uses S3
app.use("/api", fileRoutes);
app.use("/api/ai", aiRoutes);

// Log registered routes
console.log("🔍 Registered routes:");
function printRoutes(stack, basePath = "") {
  stack.forEach((r) => {
    if (r.route) {
      console.log(
        `${basePath}${r.route.path} [${Object.keys(r.route.methods).join(
          ", "
        )}]`
      );
    } else if (r.name === "router" && r.handle.stack) {
      const match = r.regexp.toString().match(/^\/\^\\\/([^\\]+)/);
      const newBase = basePath + (match ? `/${match[1]}` : "");
      printRoutes(r.handle.stack, newBase);
    }
  });
}
printRoutes(app._router.stack);

// ✅ Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ Start server
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
