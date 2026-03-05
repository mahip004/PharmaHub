// server.js - Main entry point for the backend
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
//const {jwtMiddleware, generateToken} = require('./jwt.js');
const { generateToken } = require("./config/jwt.js");
const { jwtMiddleware } = require("./middleware/jwtMiddleware.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const paymentRoutes = require("./routes/stripe.js");
const PORT = process.env.PORT || 5000;
// Import database connection
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const medicineRoutes = require("./routes/medicineRoutes.js");
const prescriptionRoutes = require("./routes/prescriptionRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const addressRoutes = require("./routes/addressRoutes.js");
const appointmentRoutes = require("./routes/appointmentRoutes.js");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (or use in-memory store if USE_MEMORY_STORE=true or no MONGO_URI)
connectDB();
if (global.USE_MEMORY_STORE) {
  require("./store/memoryStore.js"); // ensure store is loaded
}
app.use("/api/medicines", medicineRoutes);
app.use("/api", prescriptionRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api", appointmentRoutes);

app.use("/auth", authRoutes);
app.use("/api/stripe", paymentRoutes);
app.use("/users", userRoutes);

// start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
