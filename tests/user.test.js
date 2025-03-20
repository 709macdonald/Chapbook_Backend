const request = require("supertest");
const app = require("../server"); // Import your Express app

describe("User API Tests", () => {
  let createdUserId = null;

  test("Should create a new user", async () => {
    const response = await request(app).post("/api/users").send({
      firstName: "John",
      lastName: "Doe",
      email: "wrongemail@example.com",
      password: "securepassword123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    createdUserId = response.body.user.userId; // Save userId for later tests
  });

  test("Should fetch all users", async () => {
    const response = await request(app).get("/api/users");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Should fetch user by ID", async () => {
    if (!createdUserId) return;
    const response = await request(app).get(`/api/users/${createdUserId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe("johndoe@example.com");
  });

  test("Should not create a user with an existing email", async () => {
    const response = await request(app).post("/api/users").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "wrongemail@example.com",
      password: "securepassword456",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Email is already in use");
  });

  test("Should delete user by ID", async () => {
    if (!createdUserId) return;
    const response = await request(app).delete(`/api/users/${createdUserId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");
  });
});
