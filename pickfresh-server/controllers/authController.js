const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { generateToken, generateRefreshToken, jwtSecret } = require("../utils/generateToken");

// ─── Helpers ────────────────────────────────────────────────────────────────

const buildAuthResponse = async (user) => {
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    token: generateToken(user._id),
    refreshToken,
  };
};

// In development we log the OTP to console (no SMTP configured).
// In production, replace this with nodemailer or an email provider.
const sendOtpEmail = (email, otp, purpose) => {
  const label = purpose === "forgot-password" ? "password reset" : "email verification";
  console.log(`\n📧  [PickFresh OTP] Send to ${email} | Purpose: ${label} | OTP: ${otp}\n`);
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// POST /auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const allowedRoles = ["customer", "vendor", "delivery"];
    const assignedRole = allowedRoles.includes(role) ? role : "customer";

    const user = await User.create({ name, email, password, role: assignedRole });

    // Auto-send email verification OTP
    const otp = user.generateOtp("email-verify");
    await user.save();
    sendOtpEmail(email, otp, "email-verify");

    res.status(201).json({
      success: true,
      message: "Account created. Please verify your email with the OTP sent.",
      data: await buildAuthResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      success: true,
      message: "Login successful",
      data: await buildAuthResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/logout
const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /auth/refresh-token
const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error("Refresh token is required");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      res.status(401);
      throw new Error("Invalid or expired refresh token");
    }

    const user = await User.findOne({ _id: decoded.id, refreshToken: token });
    if (!user) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }

    const newToken = generateToken(user._id);
    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/me  (protected)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpiry -otpPurpose -refreshToken");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /auth/send-otp
const sendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    const validPurposes = ["email-verify", "forgot-password"];

    if (!validPurposes.includes(purpose)) {
      res.status(400);
      throw new Error("Invalid OTP purpose");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("No account found with this email");
    }

    const otp = user.generateOtp(purpose);
    await user.save();
    sendOtpEmail(email, otp, purpose);

    res.json({ success: true, message: "OTP sent to your email address" });
  } catch (error) {
    next(error);
  }
};

// POST /auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("No account found with this email");
    }

    if (!user.verifyOtp(otp, purpose)) {
      res.status(400);
      throw new Error("Invalid or expired OTP");
    }

    if (purpose === "email-verify") {
      user.isEmailVerified = true;
    }

    user.clearOtp();
    await user.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};

// POST /auth/resend-otp
const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("No account found with this email");
    }

    // Rate limit: don't resend if OTP was sent less than 60 seconds ago
    if (user.otpExpiry && Date.now() < user.otpExpiry.getTime() - 9 * 60 * 1000) {
      res.status(429);
      throw new Error("Please wait 60 seconds before requesting a new OTP");
    }

    const otp = user.generateOtp(purpose || "email-verify");
    await user.save();
    sendOtpEmail(email, otp, purpose);

    res.json({ success: true, message: "New OTP sent to your email address" });
  } catch (error) {
    next(error);
  }
};

// POST /auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // Always respond success to prevent user enumeration
    if (!user) {
      return res.json({ success: true, message: "If that email exists, an OTP has been sent" });
    }

    const otp = user.generateOtp("forgot-password");
    await user.save();
    sendOtpEmail(email, otp, "forgot-password");

    res.json({ success: true, message: "If that email exists, an OTP has been sent" });
  } catch (error) {
    next(error);
  }
};

// POST /auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("No account found with this email");
    }

    if (!user.verifyOtp(otp, "forgot-password")) {
      res.status(400);
      throw new Error("Invalid or expired OTP");
    }

    user.password = password;
    user.clearOtp();
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    res.json({ success: true, message: "Password reset successfully. Please log in." });
  } catch (error) {
    next(error);
  }
};

// POST /auth/change-password  (protected)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    res.json({ success: true, message: "Password changed successfully. Please log in again." });
  } catch (error) {
    next(error);
  }
};

// PUT /users/profile  (protected)
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
