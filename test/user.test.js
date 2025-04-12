const request = require("supertest");
const express = require("express");
const userRoutes = require("../src/routes/user.routes");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

describe("User Routes Integration", () => {
  let token;
  let createdUserId;

  const createTestUser = async () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };
    const response = await request(app).post("/api/users").send(newUser);
    createdUserId = response.body.user.userId;
    return newUser;
  };

  describe("POST /api/users", () => {
    it("should create a user", async () => {
      const user = await createTestUser();
      expect(createdUserId).toBeDefined();
    });
  });

  describe("POST /api/login", () => {
    it("should return a token", async () => {
      const user = await createTestUser();
      const res = await request(app)
        .post("/api/login")
        .send({ email: user.email, password: user.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      token = res.body.token;
    });
  });

  describe("GET /api/profile", () => {
    it("should return profile with valid token", async () => {
      const user = await createTestUser();
      const login = await request(app)
        .post("/api/login")
        .send({ email: user.email, password: user.password });
      const res = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${login.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(user.email);
    });

    it("should return 401 with no token", async () => {
      const res = await request(app).get("/api/profile");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No token, authorization denied");
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/profile")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Token is not valid");
    });
  });

  describe("GET /api/users", () => {
    it("should return a list of users", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get a user by ID", async () => {
      const user = await createTestUser();
      const res = await request(app).get(`/api/users/${createdUserId}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(user.email);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update a user", async () => {
      const user = await createTestUser();
      const res = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send({ firstName: "Updated" });
      expect(res.status).toBe(200);
      expect(res.body.user.firstName).toBe("Updated");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user", async () => {
      const user = await createTestUser();
      const res = await request(app).delete(`/api/users/${createdUserId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
    });
  });

  describe("POST /api/users edge cases", () => {
    it("should error on missing fields", async () => {
      const res = await request(app).post("/api/users").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields");
    });

    it("should error on invalid email", async () => {
      const res = await request(app).post("/api/users").send({
        firstName: "Test",
        lastName: "Invalid",
        email: "not-an-email",
        password: "1234",
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid email format");
    });
  });
});
