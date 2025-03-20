const request = require("supertest");
const app = require("../src/app");
const { v4: uuidv4 } = require("uuid");

describe("GET /api/users", () => {
  it("should return a list of users with status 200", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe("POST and PUT /api/users", () => {
  it("should create a new user, update it, and return the updated user with status 200", async () => {
    const newUser = {
      firstName: "Trevor",
      lastName: "Doe",
      email: `${uuidv4()}@gmail.com`,
      password: "securepassword123",
    };

    // POST: Create a new user
    const postResponse = await request(app).post("/api/users").send(newUser);
    const { userId } = postResponse.body.user;

    // PUT: Update the created user
    const updatedUser = {
      firstName: "Trevor Updated", // Updating first name
      lastName: "Doe Updated", // Updating last name
      email: `${uuidv4()}@gmail.com`, // Keeping email dynamic
    };

    const putResponse = await request(app)
      .put(`/api/users/${userId}`)
      .send(updatedUser);

    // Log the response body to inspect what's coming back
    console.log("PUT response body:", putResponse.body);

    // Check if the update was successful
    expect(putResponse.status).toBe(200);
    expect(putResponse.body.user.firstName).toBe(updatedUser.firstName); // Accessing nested 'user' object
    expect(putResponse.body.user.lastName).toBe(updatedUser.lastName); // Accessing nested 'user' object
    expect(putResponse.body.user.email).toBe(updatedUser.email); // Accessing nested 'user' object
  });
});
