const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -otp -otpExpiry -otpPurpose -refreshToken -passwordResetToken -passwordResetExpiry"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, data: user });
});

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.json({ success: true, message: "Profile updated", data: user.toSafeObject() });
});

// POST /api/users/upload-avatar
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image uploaded");
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });

  res.json({ success: true, message: "Avatar updated", data: { avatar: user.avatar } });
});

// DELETE /api/users/account
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: "Account deleted successfully" });
});

// GET /api/users  (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];

  const numericPage = Math.max(Number(page), 1);
  const numericLimit = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (numericPage - 1) * numericLimit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -otp -otpExpiry -otpPurpose -refreshToken -passwordResetToken -passwordResetExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { total, page: numericPage, pages: Math.ceil(total / numericLimit), limit: numericLimit },
  });
});

// GET /api/users/:id  (admin only)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -otp -otpExpiry -otpPurpose -refreshToken -passwordResetToken -passwordResetExpiry"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, data: user });
});

// PUT /api/users/:id/role  (admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ["customer", "vendor", "delivery", "admin"];

  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, message: "User role updated", data: user });
});

// DELETE /api/users/:id  (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

module.exports = { getProfile, updateProfile, uploadAvatar, deleteAccount, getAllUsers, getUserById, updateUserRole, deleteUser };
