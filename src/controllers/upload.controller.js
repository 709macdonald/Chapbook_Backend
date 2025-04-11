const AWS = require("aws-sdk");

// Initialize S3 client for signed URLs
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * Handle file uploads to S3
 */
const uploadFiles = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.log("⚠️ No files provided.");
      return res.status(400).json({ error: "No files uploaded." });
    }

    const uploadedFiles = req.files.map((file) => {
      // Ensure the file has a location property (S3 URL)
      if (!file.location) {
        console.error("Missing S3 file location:", file);
        throw new Error("S3 upload configuration error");
      }

      return {
        fileUrl: file.location, // S3 URL from multer-s3 v2
        name: file.originalname,
        key: file.key, // S3 object key for future access/deletion
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
    });

    console.log("📁 Uploaded to S3:", uploadedFiles);
    return res.json(uploadedFiles);
  } catch (error) {
    console.error("❌ S3 Upload error:", error);
    return res
      .status(500)
      .json({ error: "File upload to S3 failed: " + error.message });
  }
};

/**
 * Delete a file from S3
 * Maintains the original function name to avoid changing the API
 */
const deleteFile = async (req, res) => {
  const key = req.params.filename; // Use filename to maintain compatibility with original code

  if (!key) {
    return res.status(400).json({ error: "Missing file key" });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log("✅ Successfully deleted file from S3:", key);
    return res.json({ message: "File deleted successfully from S3" });
  } catch (error) {
    console.error("❌ Error deleting file from S3:", error);
    return res
      .status(500)
      .json({ error: "S3 file deletion failed: " + error.message });
  }
};

/**
 * Generate a signed URL for S3 files
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
  deleteFile, // Using original function name
  getSignedUrl,
};
