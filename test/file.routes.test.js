const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const fileRoutes = require("../src/routes/file.routes");
const File = require("../src/models/File"); // mock this

jest.mock("../src/models/File");

const app = express();
app.use(express.json());

// fake JWT
const fakeUserId = "test-user-123";
const token = jwt.sign({ userId: fakeUserId }, process.env.JWT_SECRET, {
  expiresIn: "1h",
});

app.use("/api", fileRoutes);

// helper to set auth
const authHeader = { Authorization: `Bearer ${token}` };

describe("File routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("POST /files - should create a new file", async () => {
    File.findOne.mockResolvedValue(null);
    File.create.mockResolvedValue({
      id: 1,
      name: "file.txt",
      UserId: fakeUserId,
    });

    const res = await request(app).post("/api/files").set(authHeader).send({
      name: "file.txt",
      text: "text content",
      date: new Date(),
      UserId: fakeUserId,
    });

    expect(res.statusCode).toBe(201);
    expect(File.create).toHaveBeenCalled();
  });

  it("GET /files - should fetch user files", async () => {
    File.findAll.mockResolvedValue([
      { toJSON: () => ({ id: 1, name: "file.txt", UserId: fakeUserId }) },
    ]);

    const res = await request(app).get("/api/files").set(authHeader);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(File.findAll).toHaveBeenCalledWith({
      where: { UserId: fakeUserId },
      order: [["date", "DESC"]],
    });
  });

  it("GET /files/:id - should fetch single file", async () => {
    File.findOne.mockResolvedValue({
      id: 1,
      name: "file.txt",
      UserId: fakeUserId,
    });

    const res = await request(app).get("/api/files/1").set(authHeader);
    expect(res.statusCode).toBe(200);
    expect(File.findOne).toHaveBeenCalled();
  });

  it("PUT /files/:id - should update file", async () => {
    const mockUpdate = jest.fn();
    File.findOne.mockResolvedValue({
      id: 1,
      update: mockUpdate,
      UserId: fakeUserId,
    });

    const res = await request(app)
      .put("/api/files/1")
      .set(authHeader)
      .send({ name: "updated.txt" });

    expect(res.statusCode).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({ name: "updated.txt" });
  });

  it("DELETE /files/:id - should delete file", async () => {
    const mockDestroy = jest.fn();
    File.findOne.mockResolvedValue({
      id: 1,
      destroy: mockDestroy,
      UserId: fakeUserId,
    });

    const res = await request(app).delete("/api/files/1").set(authHeader);
    expect(res.statusCode).toBe(200);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("DELETE /files - should delete all files for user", async () => {
    File.findAll.mockResolvedValue([]);
    File.destroy.mockResolvedValue(1);

    const res = await request(app).delete("/api/files").set(authHeader);
    expect(res.statusCode).toBe(200);
    expect(File.destroy).toHaveBeenCalledWith({
      where: { UserId: fakeUserId },
    });
  });

  it("DELETE /files/reset/:userId - should reset user files", async () => {
    File.findAll.mockResolvedValue([]);
    File.destroy.mockResolvedValue(1);

    const res = await request(app)
      .delete(`/api/files/reset/${fakeUserId}`)
      .set(authHeader);

    expect(res.statusCode).toBe(200);
    expect(File.destroy).toHaveBeenCalledWith({
      where: { UserId: fakeUserId },
    });
  });
});
