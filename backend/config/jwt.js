const jwt = require("jsonwebtoken");
const express = require("express");
//const { JWT_SECRET } = require('../config/config.js')
//const { JWT_EXPIRATION } = require('../config/config.js')
const dotenv = require("dotenv");
dotenv.config();

const generateToken = (user) => {
  const payload = { id: user.id || user._id?.toString(), email: user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || process.env.JWT_EXPIRE || "7d",
  });
  return token;
};

module.exports = { generateToken };
