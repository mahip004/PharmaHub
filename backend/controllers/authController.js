const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jwt");
const dotenv = require("dotenv");
const { verifyEmailDNS } = require("../utils/emailVerifyer");
const { OAuth2Client } = require("google-auth-library");
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const memory = () => (global.USE_MEMORY_STORE ? require("../store/memoryStore") : null);

// Register a new user
const register = async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  try {
    const mem = memory();
    if (mem) {
      const existingUser = await mem.findUserByEmail(email);
      if (existingUser) return res.status(400).json({ message: "User already exists" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await mem.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      });
      const token = generateToken(newUser);
      return res.status(201).json({ message: "User registered successfully", token });
    }

    const isValidEmail = await verifyEmailDNS(email);
    if (!isValidEmail) return res.status(400).json({ message: "Invalid email address" });
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });
    await newUser.save();
    const token = generateToken(newUser);
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const mem = memory();
    if (mem) {
      const user = await mem.findUserByEmail(email);
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
      const token = generateToken(user);
      return res.status(200).json({ message: "Login successful", token, userId: user._id, email: user.email });
    }

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = generateToken(user);
    res.status(200).json({ message: "Login successful", token, userId: user._id, email: user.email });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const googleAuth = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub } = payload;

    const mem = memory();
    if (mem) {
      let user = await mem.findUserByEmail(email);
      if (!user) {
        user = await mem.createUser({
          email,
          password: "",
          firstName: given_name,
          lastName: family_name || "",
          phone: "",
          provider: "google",
          googleId: sub
        });
      }
      const jwtToken = generateToken(user);
      return res.status(200).json({ message: "Login successful", token: jwtToken, userId: user._id, email: user.email });
    }

    let user = await userModel.findOne({ email });
    if (!user) {
      user = new userModel({
        email,
        password: "", // Google users don't need a password in our db initially
        firstName: given_name,
        lastName: family_name || "",
        phone: "",
        provider: "google",
        googleId: sub
      });
      await user.save();
    }
    const jwtToken = generateToken(user);
    res.status(200).json({ message: "Google Auth successful", token: jwtToken, userId: user._id, email: user.email });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
};

module.exports = { register, login, googleAuth };
