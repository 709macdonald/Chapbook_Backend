const File = require("../models/File");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");

// Initialize S3 client
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create a new file entry
const createFile = async (req, res) => {
  try {
    const {
      name,
      fileUrl,
      serverKey,
      type,
      date,
      text,
      matchedWords,
      locations,
      tags,
      UserId,
      fileContent, // 👈 Add this if it's not listed
    } = req.body;

    console.log("📄 Saving new file:", name);
    console.log("🧠 fileContent received:", fileContent); // 👈 Add this log

    if (!UserId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    const existing = await File.findOne({ where: { name, text, UserId } });
    if (existing) {
      return res.status(409).json({ error: "Duplicate file (name + content)" });
    }

    const newFile = await File.create({
      name,
      fileUrl,
      serverKey,
      type,
      date,
      fileContent, // 👈 Add this to the DB save too!
      text,
      matchedWords,
      locations:
        typeof locations === "string" ? JSON.parse(locations) : locations,
      tags,
      UserId,
    });

    return res.status(201).json(newFile);
  } catch (error) {
    console.error("Error creating file:", error);
    return res.status(500).json({ error: "Failed to create file" });
  }
};

// Get all users files
const getAllFiles = async (req, res) => {
  console.log("✅ getAllFiles triggered");
  try {
    // Get the userId from the auth middleware
    const userId = req.userId;

    // Filter files by user ID
    const files = await File.findAll({
      where: { UserId: userId },
      order: [["date", "DESC"]],
    });

    // Process files to generate fresh signed URLs
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const fileData = file.toJSON();

        // Only regenerate URLs for files with a serverKey (S3 files)
        if (fileData.serverKey) {
          // Generate fresh signed URL
          const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileData.serverKey,
            Expires: 60 * 60, // Increase to 1 hour
            ResponseContentDisposition: "inline",
          };

          try {
            const signedUrl = s3.getSignedUrl("getObject", params);
            fileData.fileUrl = signedUrl;
            console.log(`✅ Generated fresh URL for ${fileData.name}`);
          } catch (err) {
            console.error(
              `❌ Error generating signed URL for ${fileData.name}:`,
              err
            );
            // Keep the existing URL
          }
        }

        return fileData;
      })
    );

    return res.status(200).json(processedFiles);
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    return res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Get file by ID
const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const file = await File.findOne({
      where: {
        id: id,
        UserId: userId, // Only get the file if it belongs to this user
      },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({ error: "Failed to fetch file" });
  }
};

// Update file
const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.userId;

    const file = await File.findOne({
      where: {
        id: id,
        UserId: userId, // Only update files that belong to this user
      },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    await file.update(updates);

    return res.status(200).json(file);
  } catch (error) {
    console.error("Error updating file:", error);
    return res.status(500).json({ error: "Failed to update file" });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const file = await File.findOne({
      where: {
        id: id,
        UserId: userId, // Only delete files that belong to this user
      },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete from S3 if using S3 storage and we have a serverKey
    if (process.env.USE_S3 === "true" && file.serverKey) {
      try {
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: file.serverKey,
        };

        await s3.deleteObject(params).promise();
        console.log(`✅ Deleted file from S3: ${file.serverKey}`);
      } catch (s3Error) {
        console.error("❌ Error deleting from S3:", s3Error);
        // Continue with DB deletion even if S3 deletion fails
      }
    }

    await file.destroy();

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Failed to delete file" });
  }
};

// Delete all files for the current user
const deleteAllFiles = async (req, res) => {
  try {
    const userId = req.userId;

    // If using S3, get all files to delete them from S3 first
    if (process.env.USE_S3 === "true") {
      const files = await File.findAll({
        where: { UserId: userId },
      });

      // Delete each file from S3
      for (const file of files) {
        if (file.serverKey) {
          try {
            const params = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: file.serverKey,
            };

            await s3.deleteObject(params).promise();
            console.log(`✅ Deleted file from S3: ${file.serverKey}`);
          } catch (s3Error) {
            console.error(
              `❌ Error deleting file from S3: ${file.serverKey}`,
              s3Error
            );
            // Continue with next file even if this one fails
          }
        }
      }
    }

    // Only delete files for the current user
    await File.destroy({
      where: { UserId: userId },
    });

    res.status(200).json({ message: "All your files deleted successfully" });
  } catch (err) {
    console.error("Error deleting all files:", err);
    res.status(500).json({ error: "Failed to delete all files" });
  }
};

const resetUserFiles = async (req, res) => {
  const { userId } = req.params;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // If using S3, get all files to delete them from S3 first
    if (process.env.USE_S3 === "true") {
      const files = await File.findAll({
        where: { UserId: userId },
      });

      // Delete each file from S3
      for (const file of files) {
        if (file.serverKey) {
          try {
            const params = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: file.serverKey,
            };

            await s3.deleteObject(params).promise();
            console.log(`✅ Deleted file from S3: ${file.serverKey}`);
          } catch (s3Error) {
            console.error(
              `❌ Error deleting file from S3: ${file.serverKey}`,
              s3Error
            );
            // Continue with next file even if this one fails
          }
        }
      }
    }

    await File.destroy({ where: { UserId: userId } });
    res.status(200).json({ message: "All user files deleted successfully" });
  } catch (err) {
    console.error("Error deleting user files:", err);
    res.status(500).json({ error: "Failed to delete user files" });
  }
};

module.exports = {
  createFile,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile,
  deleteAllFiles,
  resetUserFiles,
};
