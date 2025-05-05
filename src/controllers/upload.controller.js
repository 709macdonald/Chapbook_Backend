const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadFiles = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.log("⚠️ No files provided.");
      return res.status(400).json({ error: "No files uploaded." });
    }

    // === 🔐 Backend File Upload Validation ===
    const MAX_FILES = 20;
    const MAX_FILE_SIZE_MB = 100;
    const MAX_TOTAL_SIZE_MB = 100;
    const allowedExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "webp",
      "doc",
      "docx",
    ];

    if (req.files.length > MAX_FILES) {
      return res
        .status(400)
        .json({ error: `Too many files. Maximum allowed is ${MAX_FILES}.` });
    }

    const invalidFiles = req.files.filter((file) => {
      const ext = file.originalname.split(".").pop()?.toLowerCase();
      return !allowedExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        error: `Some files have unsupported types. Allowed: ${allowedExtensions.join(
          ", "
        )}`,
      });
    }

    const totalSizeMB =
      req.files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      return res.status(400).json({
        error: `Total upload size exceeds ${MAX_TOTAL_SIZE_MB}MB.`,
      });
    }

    for (const file of req.files) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return res.status(400).json({
          error: `${file.originalname} exceeds the ${MAX_FILE_SIZE_MB}MB file size limit.`,
        });
      }
    }

    const uploadedFiles = req.files.map((file) => {
      if (!file.location) {
        console.error("Missing S3 file location:", file);
        throw new Error("S3 upload configuration error");
      }

      return {
        fileUrl: file.location,
        name: file.originalname,
        key: file.key,
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

const deleteFile = async (req, res) => {
  const key = req.params.filename;

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

const getSignedUrl = (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ error: "Missing file key" });
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 60 * 5,
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

const deleteAllUserFilesFromS3 = async (req, res) => {
  const { files } = req.body;

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "No files provided to delete." });
  }

  const deleteObjects = files
    .filter((file) => file.key)
    .map((file) => ({ Key: file.key }));

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Delete: { Objects: deleteObjects },
  };

  try {
    const result = await s3.deleteObjects(params).promise();
    console.log("🧹 Deleted multiple files from S3:", result.Deleted);
    return res.json({
      message: "Files deleted from S3",
      deleted: result.Deleted,
    });
  } catch (error) {
    console.error("❌ Error deleting multiple files from S3:", error);
    return res.status(500).json({
      error: "Failed to delete files from S3: " + error.message,
    });
  }
};

module.exports = {
  uploadFiles,
  deleteFile,
  getSignedUrl,
  deleteAllUserFilesFromS3,
};
