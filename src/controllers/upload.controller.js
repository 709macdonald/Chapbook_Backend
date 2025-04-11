const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk"); // Use AWS SDK v2 consistently

// Initialize S3 client for signed URLs
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadDir = path.join(__dirname, "..", "uploads");

/**
 * Handle file uploads from multer/multer-s3
 */
const uploadFiles = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.log("⚠️ No files provided.");
      return res.status(400).json({ error: "No files uploaded." });
    }

    const uploadedFiles = req.files.map((file) => {
      // Log file structure to help with debugging
      console.log("File object structure:", JSON.stringify(file, null, 2));

      return {
        fileUrl:
          process.env.USE_S3 === "true"
            ? file.location // S3 URL from multer-s3 v2
            : `http://localhost:5005/uploads/${file.filename}`,
        name: file.originalname,
        key: file.key || file.filename, // S3: file.key | Local: file.filename
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
    });

    console.log("📁 Uploaded:", uploadedFiles);
    return res.json(uploadedFiles);
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
};

/**
 * Delete a file (local storage only)
 */
const deleteFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("❌ Error deleting file:", err);
      return res.status(500).json({ error: "File deletion failed" });
    }

    console.log("✅ Successfully deleted file:", filename);
    return res.json({ message: "File deleted successfully" });
  });
};

/**
 * Generate a signed URL for S3 files using AWS SDK v2
 */
const getSignedUrl = (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ error: "Missing file key" });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 60 * 5, // URL valid for 5 minutes
    ResponseContentDisposition: "inline",
  };

  try {
    const signedUrl = s3.getSignedUrl("getObject", params);
    return res.json({ url: signedUrl });
  } catch (err) {
    console.error("❌ Signed URL generation error:", err);
    return res.status(500).json({ error: "Failed to generate signed URL" });
  }
};

module.exports = {
  uploadFiles,
  deleteFile,
  getSignedUrl,
};
