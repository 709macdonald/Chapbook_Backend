const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // update path as needed

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub } = payload;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        password: sub, // could hash if you want
      });
    }

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token: jwtToken, userId: user.id });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({ error: "Google token invalid" });
  }
};

module.exports = { handleGoogleLogin };
