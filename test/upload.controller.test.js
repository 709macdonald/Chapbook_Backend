const uploadController = require("../src/controllers/upload.controller");

describe("uploadFiles controller", () => {
  it("should upload files and return the uploaded files with status 200", () => {
    const req = {
      files: [
        {
          originalname: "file1.txt",
          filename: "file1-12345.txt",
          size: 1024,
        },
        {
          originalname: "file2.jpg",
          filename: "file2-67890.jpg",
          size: 2048,
        },
      ],
    };

    const res = {
      json: jest.fn(),
    };

    uploadController.uploadFiles(req, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        fileUrl: "http://localhost:5005/uploads/file1-12345.txt",
        name: "file1.txt",
        key: "file1-12345.txt",
        size: 1024,
        uploadedAt: expect.any(String),
      },
      {
        fileUrl: "http://localhost:5005/uploads/file2-67890.jpg",
        name: "file2.jpg",
        key: "file2-67890.jpg",
        size: 2048,
        uploadedAt: expect.any(String),
      },
    ]);
  });

  it("should return an error with status 500 if file upload fails", () => {
    const req = {
      files: [],
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    uploadController.uploadFiles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "File upload failed" });
  });
});
