const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");
const fileRoutes = require("./routes/file.routes");
const uploadRoutes = require("./routes/upload.routes"); // ✅ renamed from multerUploadRouter
const aiRoutes = require("./routes/ai.routes");
const sequelize = require("./config/database");
const path = require("path");

dotenv.config();

console.log(
  "OPENAI_API_KEY:",
  process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing"
);

console.log("UploadThing Environment Variables:");
console.log(
  "UPLOADTHING_TOKEN:",
  process.env.UPLOADTHING_TOKEN ? "Set" : "Not set"
);
console.log(
  "UPLOADTHING_SECRET:",
  process.env.UPLOADTHING_SECRET ? "Set" : "Not set"
);
console.log(
  "UPLOADTHING_APP_ID:",
  process.env.UPLOADTHING_APP_ID ? "Set" : "Not set"
);

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
app.use("/api", uploadRoutes); // ✅ new modularized route
app.use("/api", fileRoutes);
app.use("/api/ai", aiRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await sequelize.sync({ alter: true }); // ✅ Safe update
    console.log("✅ Database synced");

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`Upload endpoint: http://localhost:${port}/api/upload-local`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

startServer();
