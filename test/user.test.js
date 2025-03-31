const request = require("supertest");
// Replace the app import with direct Express setup
const express = require("express");
const userRoutes = require("../src/routes/user.routes");
const { v4: uuidv4 } = require("uuid");

// Create a test app instance
const app = express();
app.use(express.json());
app.use("/api", userRoutes);

// CRUD TESTS

describe("POST and PUT /api/users", () => {
  it("should create a new user, update it, and return the updated user with status 200", async () => {
    const newUser = {
      firstName: "Trevor",
      lastName: "Doe",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    const postResponse = await request(app).post("/api/users").send(newUser);
    const { userId } = postResponse.body.user;

    const updatedUser = {
      firstName: "Trevor Updated",
      lastName: "Doe Updated",
      email: `${uuidv4()}@gmail.com`,
    };

    const putResponse = await request(app)
      .put(`/api/users/${userId}`)
      .send(updatedUser);

    console.log("PUT response body:", putResponse.body);

    expect(putResponse.status).toBe(200);
    expect(putResponse.body.user.firstName).toBe(updatedUser.firstName);
    expect(putResponse.body.user.lastName).toBe(updatedUser.lastName);
    expect(putResponse.body.user.email).toBe(updatedUser.email);
  });
});

describe("GET /api/users/:id", () => {
  it("should return the user by userId with status 200", async () => {
    const newUser = {
      firstName: "Cre",
      lastName: "Ation",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    const postResponse = await request(app).post("/api/users").send(newUser);

    const { userId } = postResponse.body.user;

    const getResponse = await request(app).get(`/api/users/${userId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty("userId");
    expect(getResponse.body.userId).toBe(userId);
    expect(getResponse.body.firstName).toBe(newUser.firstName);
    expect(getResponse.body.lastName).toBe(newUser.lastName);
    expect(getResponse.body.email).toBe(newUser.email);
  });
});

describe("GET /api/users", () => {
  it("should return a list of users with status 200", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete the user and return status 200", async () => {
    const newUser = {
      firstName: "Danny",
      lastName: "Deleto",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    const postResponse = await request(app).post("/api/users").send(newUser);
    const { userId } = postResponse.body.user;

    const deleteResponse = await request(app).delete(`/api/users/${userId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe("User deleted successfully");

    const getResponse = await request(app).get(`/api/users/${userId}`);
    expect(getResponse.status).toBe(404);
    expect(getResponse.body.error).toBe("User not found");
  });
});

describe("POST /api/login", () => {
  it("should return a token for valid login", async () => {
    const newUser = {
      firstName: "Logan",
      lastName: "Tester",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    await request(app).post("/api/users").send(newUser);

    const loginCredentials = {
      email: newUser.email,
      password: newUser.password,
    };

    const response = await request(app)
      .post("/api/login")
      .send(loginCredentials);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });

  it("should return an error for invalid login credentials", async () => {
    const invalidCredentials = {
      email: "wrongemail@gmail.com",
      password: "wrongpassword",
    };

    const response = await request(app)
      .post("/api/login")
      .send(invalidCredentials);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid email or password");
  });
});

describe("GET /api/profile", () => {
  it("should return the user profile for valid token", async () => {
    const newUser = {
      firstName: "Petey",
      lastName: "Profile",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    const postResponse = await request(app).post("/api/users").send(newUser);

    const loginCredentials = {
      email: newUser.email,
      password: newUser.password,
    };

    const loginResponse = await request(app)
      .post("/api/login")
      .send(loginCredentials);

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userId");
    expect(response.body.firstName).toBe(newUser.firstName);
    expect(response.body.lastName).toBe(newUser.lastName);
    expect(response.body.email).toBe(newUser.email);
  });

  it("should return 401 for a protected route if no token is provided", async () => {
    const response = await request(app).get("/api/profile");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("No token provided");
  });

  it("should return 401 for an invalid or expired token", async () => {
    const invalidToken = "invalid.jwt.token";

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or expired token");
  });
});

// CHAT GPT RECOMMENDED TESTS

describe("POST /api/users (Edge Case Tests)", () => {
  it("should return an error when creating a user with missing fields", async () => {
    const newUser = {
      firstName: "Trevor",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");
  });

  it("should return an error when creating a user with invalid email format", async () => {
    const newUser = {
      firstName: "Trevor",
      lastName: "Doe",
      email: "invalid-email",
      password: "securepassword123",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid email format");
  });
});

describe("POST /api/login (Token Expiration)", () => {
  it("should return an error for an expired token", async () => {
    const newUser = {
      firstName: "Trevor",
      lastName: "Doe",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    const postResponse = await request(app).post("/api/users").send(newUser);
    const loginResponse = await request(app).post("/api/login").send({
      email: newUser.email,
      password: newUser.password,
    });

    const { token } = loginResponse.body;

    setTimeout(async () => {
      const response = await request(app)
        .get("/api/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid or expired token");
    }, 3600000);
  });
});

describe("Authorization Tests", () => {
  it("should return 401 for /profile if no token is provided", async () => {
    const response = await request(app).get("/api/profile");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("No token provided");
  });

  it("should return 401 for /profile if an invalid token is provided", async () => {
    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer invalidtoken");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid or expired token");
  });
});

describe("Concurrent User Update (Concurrency Testing)", () => {
  it("should handle concurrent user updates properly", async () => {
    const newUser = {
      firstName: "Trevor",
      lastName: "Doe",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    const postResponse = await request(app).post("/api/users").send(newUser);
    const { userId } = postResponse.body.user;

    const updatePromises = [
      request(app).put(`/api/users/${userId}`).send({ firstName: "Updated1" }),
      request(app).put(`/api/users/${userId}`).send({ firstName: "Updated2" }),
    ];

    const [response1, response2] = await Promise.all(updatePromises);

    console.log("PUT Response 1:", response1.body);
    console.log("PUT Response 2:", response2.body);

    expect(response1.body).toHaveProperty("user");
    expect(response2.body).toHaveProperty("user");

    expect(response1.body.user).toHaveProperty("firstName");
    expect(response2.body.user).toHaveProperty("firstName");

    expect([
      response1.body.user.firstName,
      response2.body.user.firstName,
    ]).toEqual(expect.arrayContaining(["Updated1", "Updated2"]));
  });
});
