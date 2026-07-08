const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { generateToken, generateRefreshToken, jwtSecret } = require("../utils/generateToken");
const { sendSuccess } = require("../utils/responseHandler");
const { sendEmail, getOtpTemplate, getWelcomeTemplate, getPasswordChangedTemplate } = require("../utils/emailService");

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

const sendOtpEmail = async (email, otp, purpose) => {
  const subject = purpose === "forgot-password" ? "Reset your password" : "Verify your email address";
  const html = getOtpTemplate(otp, purpose);
  await sendEmail({ to: email, subject, html });
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
    await sendOtpEmail(email, otp, "email-verify");

    const authData = await buildAuthResponse(user);

    sendSuccess(res, "Account created. Please verify your email with the OTP sent.", authData, 201);
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

    const authData = await buildAuthResponse(user);
    sendSuccess(res, "Login successful", authData);
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

    sendSuccess(res, "Logged out successfully");
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

    // Refresh token rotation: generate new access & refresh tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    sendSuccess(res, "Token refreshed successfully", {
      token: newAccessToken,
      refreshToken: newRefreshToken
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
    sendSuccess(res, "User profile loaded", user);
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
    await sendOtpEmail(email, otp, purpose);

    sendSuccess(res, "OTP sent to your email address");
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

    const isValid = await user.verifyOtp(otp, purpose);
    if (!isValid) {
      res.status(400);
      throw new Error("Invalid or expired OTP");
    }

    if (purpose === "email-verify") {
      user.isEmailVerified = true;
      // Send welcome email upon verification
      await sendEmail({
        to: user.email,
        subject: "Welcome to PickFresh! 🥬",
        html: getWelcomeTemplate(user.name)
      }).catch(err => console.error("Error sending welcome email:", err));
    }

    user.clearOtp();
    await user.save();

    sendSuccess(res, "OTP verified successfully");
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
    await sendOtpEmail(email, otp, purpose);

    sendSuccess(res, "New OTP sent to your email address");
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
      return sendSuccess(res, "If that email exists, an OTP has been sent");
    }

    const otp = user.generateOtp("forgot-password");
    await user.save();
    await sendOtpEmail(email, otp, "forgot-password");

    sendSuccess(res, "If that email exists, an OTP has been sent");
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

    const isValid = await user.verifyOtp(otp, "forgot-password");
    if (!isValid) {
      res.status(400);
      throw new Error("Invalid or expired OTP");
    }

    user.password = password;
    user.clearOtp();
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    sendSuccess(res, "Password reset successfully. Please log in.");
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

    // Send password changed alert
    await sendEmail({
      to: user.email,
      subject: "Security Alert: Password Changed",
      html: getPasswordChangedTemplate()
    }).catch(err => console.error("Error sending password change email:", err));

    sendSuccess(res, "Password changed successfully. Please log in again.");
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

    sendSuccess(res, "Profile updated successfully", user.toSafeObject());
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
