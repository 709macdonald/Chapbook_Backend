const request = require("supertest");
const app = require("../src/app");
const { v4: uuidv4 } = require("uuid");

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
      firstName: "Trevor",
      lastName: "Doe",
      email: `${uuidv4()}@gmail.com`, // Fixed the missing backticks
      password: "securepassword123",
    };

    const postResponse = await request(app).post("/api/users").send(newUser);

    const { userId } = postResponse.body.user;

    const getResponse = await request(app).get(`/api/users/${userId}`); // Fixed the missing backticks

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
      firstName: "Trevor",
      lastName: "Doe",
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
