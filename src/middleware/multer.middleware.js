const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const path = require("path");

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
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname, originalName: file.originalname });
    },
    key: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type restrictions if needed
    const allowedFileTypes =
      /pdf|doc|docx|txt|rtf|md|xlsx|xls|csv|jpg|jpeg|png/;
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

module.exports = upload;
