// src/routes/uploadRouter.js
const { createUploadthing } = require("uploadthing/express");
const { verifyToken } = require("../utils/auth"); // ✅ adjust path if needed

const f = createUploadthing();

exports.uploadRouter = {
  fileUploader: f({
    "image/*": { maxFileSize: "4MB" },
    "application/pdf": { maxFileSize: "10MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "10MB",
    },
    "application/vnd.apple.pages": { maxFileSize: "10MB" },
  })
    .middleware(async ({ req }) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized: No token provided");
      }

      const token = authHeader.split(" ")[1];
      const user = verifyToken(token); // ✅ your existing function

      if (!user) {
        throw new Error("Unauthorized: Invalid or expired token");
      }

      // This gets passed into onUploadComplete
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const userId = metadata.userId;
      console.log(`✅ User ${userId} uploaded:`, file);

      // ✅ Optional: Save this file info and userId to your database
    }),
};
