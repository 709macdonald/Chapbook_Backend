jest.mock("../src/config/openai.config", () => ({
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
}));

const aiController = require("../src/controllers/ai.controller");
const openai = require("../src/config/openai.config"); // make sure this path matches your structure

describe("generateResponse controller", () => {
  it("should return an error with status 400 if prompt is not provided", () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    aiController.generateResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Prompt is required" });
  });

  it("should generate a response and return it with status 200", async () => {
    const req = {
      body: {
        prompt: "Hello, how are you?",
      },
    };

    const res = {
      json: jest.fn(),
    };

    const mockResponse = {
      choices: [
        {
          message: {
            content: "I'm doing well, thank you!",
          },
        },
      ],
    };

    openai.chat.completions.create.mockResolvedValue(mockResponse);

    await aiController.generateResponse(req, res);

    expect(openai.chat.completions.create).toHaveBeenCalledWith({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, how are you?" }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    expect(res.json).toHaveBeenCalledWith({
      content: "I'm doing well, thank you!",
    });
  });

  it("should return an error with status 500 if OpenAI API call fails", async () => {
    const req = {
      body: {
        prompt: "Hello, how are you?",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    openai.chat.completions.create.mockRejectedValue(
      new Error("OpenAI API error")
    );

    await aiController.generateResponse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error: OpenAI API error",
    });
  });
});
