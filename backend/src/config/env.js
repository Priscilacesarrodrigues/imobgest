const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: process.env.PORT || 3333,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "dev_secret_123",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
};

module.exports = { env };
