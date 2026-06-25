const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "secret123";
const accessTokenExpiry = process.env.JWT_EXPIRES_IN || "15m";
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const generateToken = (id, expiresIn = accessTokenExpiry) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn,
  });
};

const generateRefreshToken = (id) => generateToken(id, refreshTokenExpiry);

module.exports = {
  generateToken,
  generateRefreshToken,
  jwtSecret,
};
