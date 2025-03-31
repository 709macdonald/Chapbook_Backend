const dotenv = require("dotenv");
dotenv.config();

// Create token in the exact format UploadThing expects
const makeToken = () => {
  const tokenData = {
    apiKey: process.env.UPLOADTHING_SECRET,
    appId: process.env.UPLOADTHING_APP_ID,
    regions: ["auto"],
  };

  console.log("Token data:", tokenData);

  // Make sure we're not missing any required fields
  if (!tokenData.apiKey || !tokenData.appId) {
    console.error("ERROR: Missing required fields for token");
    return null;
  }

  // Convert to JSON string and base64 encode
  const tokenString = JSON.stringify(tokenData);
  const base64Token = Buffer.from(tokenString).toString("base64");

  return base64Token;
};

const token = makeToken();
console.log("\nGenerated token:", token);
console.log("\nAdd this to your .env file as:");
console.log("UPLOADTHING_TOKEN=" + token);
