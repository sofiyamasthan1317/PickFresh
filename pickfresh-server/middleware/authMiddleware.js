const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const { jwtSecret } = require("../utils/generateToken");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select("-password -otp -otpExpiry -otpPurpose -refreshToken");

    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }

    if (user.isBlocked) {
      res.status(403);
      return next(new Error("Your account has been blocked. Contact support."));
    }

    req.user = user;
    next();
  } catch {
    res.status(401);
    return next(new Error("Invalid or expired token"));
  }
};

// Optional protect: if token present, verify and set req.user; otherwise continue anonymously
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select("-password -otp -otpExpiry -otpPurpose -refreshToken");
    if (user && user.isBlocked) {
      res.status(403);
      return next(new Error("Your account has been blocked. Contact support."));
    }
    if (user) req.user = user;
  } catch (err) {
    // Ignore invalid/expired token for optional flow
  }
  return next();
};

module.exports = { protect, optionalProtect };
