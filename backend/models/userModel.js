// models/User.js - User model
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;