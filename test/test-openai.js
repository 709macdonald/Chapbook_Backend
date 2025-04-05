// Create a new file called test-openai.js in your backend folder

const { OpenAI } = require("openai");
require("dotenv").config();

// Log environment variable details
console.log("Environment Variables Check:");
console.log("- OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
if (process.env.OPENAI_API_KEY) {
  console.log("- Key starts with:", process.env.OPENAI_API_KEY.substring(0, 7));
  console.log("- Key length:", process.env.OPENAI_API_KEY.length);
}

// Try with the environment variable
async function testWithEnvVar() {
  console.log("\nTesting with environment variable...");

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });

    console.log("✅ SUCCESS! Response:", completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error("❌ ERROR with environment variable:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

// Try with a hardcoded key (replace with your actual key for testing only)
async function testWithHardcodedKey() {
  console.log("\nTesting with hardcoded key...");

  // ⚠️ NOTE: This is for debugging only! Never commit this to your codebase with a real key!
  const API_KEY = "YOUR_ACTUAL_API_KEY_HERE"; // Replace this with your actual key for testing

  try {
    const openai = new OpenAI({
      apiKey: API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10,
    });

    console.log("✅ SUCCESS! Response:", completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error("❌ ERROR with hardcoded key:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

// Run both tests
async function runTests() {
  const envVarResult = await testWithEnvVar();

  if (!envVarResult) {
    console.log(
      "\n⚠️ Environment variable test failed. Trying with hardcoded key..."
    );
    await testWithHardcodedKey();
  }

  console.log("\nTests completed.");
}

runTests();
