// config/env.js - Environment variables configuration
module.exports = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/skillconnect',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_EXPIRE: '1h'
  };