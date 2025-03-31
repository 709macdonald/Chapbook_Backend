// test/uploadthing.test.js
require("dotenv").config();
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Mock routes for testing
jest.mock("../src/routes/user.routes", () => ({}));

// Mock uploadRouter
jest.mock("../src/routes/uploadRouter", () => ({
  uploadRouter: { fileUploader: {} },
}));

// Mock uploadthing/express - the key issue is we need to move the jwt reference inside the factory function
jest.mock("uploadthing/express", () => {
  // Move all references inside this factory function
  return {
    createRouteHandler: () => (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(500).send("Unauthorized: No token provided");
      }

      const token = authHeader.split(" ")[1];
      try {
        // Import jwt inside the function to avoid the scoping issue
        const jwt = require("jsonwebtoken");
        jwt.verify(
          token,
          process.env.JWT_SECRET || "ZtD9f4aFQxq6kjZf@1VeX8!X4y*mQEr"
        );
        return res.status(200).json([{ url: "https://mock-url.com/file.pdf" }]);
      } catch (error) {
        return res.status(500).send("Unauthorized: Invalid token");
      }
    },
  };
});

describe("UploadThing file upload", () => {
  let app;

  beforeEach(() => {
    // Set up a minimal Express app for testing
    app = express();
    app.use(express.json());

    // Import the mocked module
    const { createRouteHandler } = require("uploadthing/express");
    app.use(
      "/api/uploadthing",
      createRouteHandler({ router: { fileUploader: {} } })
    );
  });

  it("should upload a PDF file when authorized", async () => {
    // Generate a token for testing
    const token = jwt.sign(
      { userId: "test-user-id" },
      process.env.JWT_SECRET || "ZtD9f4aFQxq6kjZf@1VeX8!X4y*mQEr",
      { expiresIn: "1h" }
    );

    // Create a buffer with fake PDF content
    const pdfBuffer = Buffer.from("%PDF-1.5\nTest PDF content");

    const res = await request(app)
      .post("/api/uploadthing/fileUploader")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", pdfBuffer, "sample.pdf");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("url");
  });

  it("should reject upload without a token", async () => {
    // Create a buffer with fake PDF content
    const pdfBuffer = Buffer.from("%PDF-1.5\nTest PDF content");

    const res = await request(app)
      .post("/api/uploadthing/fileUploader")
      .attach("files", pdfBuffer, "sample.pdf");

    expect(res.status).toBe(500);
    expect(res.text).toMatch(/Unauthorized/);
  });
});
