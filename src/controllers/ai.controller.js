// controllers/ai.controller.js
const openai = require("../config/openai.config");

const generateResponse = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  console.log(
    "🔐 ENV OPENAI_API_KEY (first 10 chars):",
    process.env.OPENAI_API_KEY?.slice(0, 10) || "❌ Not found"
  );

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    res.json({ content });
  } catch (err) {
    console.error("❌ OpenAI error:", err);

    let errorMessage = "Failed to generate content";
    if (err.response) {
      console.error("Details:", err.response.data);
      errorMessage = `OpenAI API error: ${
        err.response.data.error?.message || err.message
      }`;
    } else if (err.message) {
      errorMessage = `Error: ${err.message}`;
    }

    res.status(500).json({ error: errorMessage });
  }
};

module.exports = {
  generateResponse,
};
