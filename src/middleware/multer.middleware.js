const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk"); // Use AWS SDK v2 consistently
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist (for local storage)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

const useS3 = process.env.USE_S3 === "true";
console.log(`🔧 Storage mode: ${useS3 ? "S3" : "Local"}`);

let upload;

if (useS3) {
  // Configure AWS S3 with AWS SDK v2
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const s3 = new AWS.S3();

  // Verify S3 credentials
  console.log("🔍 Verifying S3 credentials...");
  s3.listBuckets((err, data) => {
    if (err) {
      console.error("❌ S3 connection error:", err);
    } else {
      console.log(`✅ S3 connected, found ${data.Buckets.length} buckets`);
      console.log(`🪣 Using bucket: ${process.env.S3_BUCKET_NAME}`);
    }
  });

  // Configure multer-s3 with AWS SDK v2
  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET_NAME,
      acl: "private",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
      },
    }),
  });
} else {
  // Configure local storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  upload = multer({ storage });
}

module.exports = upload;
