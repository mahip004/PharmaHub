const jwt = require("jsonwebtoken");
const express = require("express");
//const { JWT_SECRET } = require('../config/config.js')
//const { JWT_EXPIRATION } = require('../config/config.js')
const dotenv = require("dotenv");
dotenv.config();

const jwtMiddleware = (req, res, next) => {
  //console.log(req.headers.authorization)
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {}
};

module.exports = { jwtMiddleware };
