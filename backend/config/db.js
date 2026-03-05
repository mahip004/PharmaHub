// config/db.js - Database connection configuration
const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async () => {
  const useMemory = process.env.USE_MEMORY_STORE === "true" || !process.env.MONGO_URI || process.env.MONGO_URI === "memory";
  if (useMemory) {
    global.USE_MEMORY_STORE = true;
    console.log("Running with in-memory store (no MongoDB)");
    return;
  }
  try {
    await mongoose.connect(config.MONGO_URI, {});
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;