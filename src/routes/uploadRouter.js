const express = require("express");
const {
  createUploadthing,
  createRouteHandler,
} = require("uploadthing/express");

const router = express.Router();

const NGROK_URL =
  "https://cb37-2607-fea8-d59f-ed00-a0ea-2d86-9d00-9ae3.ngrok-free.app";

router.use((req, res, next) => {
  console.log(`📝 ${req.method} request to: ${req.originalUrl}`);
  console.log(`📝 Headers:`, req.headers);
  next();
});

const f = createUploadthing({
  isDev: true,
});

const fileUploader = f({
  "image/*": { maxFileSize: "4MB" },
  "application/pdf": { maxFileSize: "10MB" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    maxFileSize: "10MB",
  },
  "application/vnd.apple.pages": { maxFileSize: "10MB" },
})
  .middleware(async ({ req }) => {
    const authToken = req.headers["x-auth-token"];
    console.log(
      "👤 Auth token received:",
      authToken ? "Present" : "Not present"
    );

    return {
      userId: "test-user",
      uploadedAt: new Date().toISOString(),
    };
  })
  .onUploadComplete(async ({ file, metadata }) => {
    console.log(`📦 File uploaded:`, file);
    console.log(`📄 Upload metadata:`, metadata);

    return {
      url: file.url,
      name: file.name,
      key: file.key,
      size: file.size,
      uploadedAt: metadata.uploadedAt,
    };
  });

router.use(
  "/uploadthing",
  createRouteHandler({
    router: { fileUploader },
    config: {
      isDev: true,
      token: process.env.UPLOADTHING_TOKEN,
      callbackUrl: `${NGROK_URL}/api/uploadthing`,
    },
  })
);

module.exports = router;
