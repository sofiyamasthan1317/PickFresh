const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenHandler,
  getMe,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} = require("../controllers/authController");

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["customer", "vendor", "delivery"])
      .withMessage("Invalid user role"),
  ],
  validateRequest,
  registerUser
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  loginUser
);

// POST /api/auth/logout
router.post(
  "/logout",
  [
    body("refreshToken").optional().notEmpty().withMessage("Refresh token cannot be empty"),
  ],
  validateRequest,
  logoutUser
);

// POST /api/auth/refresh-token
router.post(
  "/refresh-token",
  [
    body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  ],
  validateRequest,
  refreshTokenHandler
);

// GET /api/auth/me (Protected)
router.get("/me", protect, getMe);

// POST /api/auth/send-otp
router.post(
  "/send-otp",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("purpose")
      .isIn(["email-verify", "forgot-password"])
      .withMessage("Invalid purpose. Must be email-verify or forgot-password"),
  ],
  validateRequest,
  sendOtp
);

// POST /api/auth/verify-otp
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 characters"),
    body("purpose")
      .isIn(["email-verify", "forgot-password"])
      .withMessage("Invalid purpose. Must be email-verify or forgot-password"),
  ],
  validateRequest,
  verifyOtp
);

// POST /api/auth/resend-otp
router.post(
  "/resend-otp",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("purpose")
      .isIn(["email-verify", "forgot-password"])
      .withMessage("Invalid purpose. Must be email-verify or forgot-password"),
  ],
  validateRequest,
  resendOtp
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  ],
  validateRequest,
  forgotPassword
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 characters"),
    body("password").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  validateRequest,
  resetPassword
);

// POST /api/auth/change-password (Protected)
router.post(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  validateRequest,
  changePassword
);

// PUT /api/auth/profile (Protected)
router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim(),
    body("avatar").optional().trim(),
  ],
  validateRequest,
  updateProfile
);

module.exports = router;
