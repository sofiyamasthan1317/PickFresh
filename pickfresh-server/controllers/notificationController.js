const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");
const { sendSuccess } = require("../utils/responseHandler");
const socketHandler = require("../utils/socket");

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, filter = "all" } = req.query;
  const numericPage = Math.max(Number(page), 1);
  const numericLimit = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (numericPage - 1) * numericLimit;

  const query = { user: req.user._id };
  if (filter === "unread") query.isRead = false;
  if (filter === "read") query.isRead = true;

  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(numericLimit).lean(),
    Notification.countDocuments(query),
  ]);

  sendSuccess(res, "Notifications loaded successfully", {
    notifications,
    pagination: { total, page: numericPage, pages: Math.ceil(total / numericLimit), limit: numericLimit },
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  sendSuccess(res, "Unread count loaded", { count });
});

// PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  sendSuccess(res, "Notification marked as read", notification);
});

// PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  sendSuccess(res, "All notifications marked as read");
});

// DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  sendSuccess(res, "Notification deleted successfully");
});

const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  sendSuccess(res, "All notifications cleared");
});

// Admin: broadcast notification to recipients
const sendBroadcast = asyncHandler(async (req, res) => {
  const User = require("../models/UserModel");
  const { title, message, type = "system", priority = "medium", recipientType = "all-users", userIds = [], role } = req.body;

  const filter = {};
  if (recipientType === "single-user" && userIds?.length) {
    filter._id = { $in: userIds };
  } else if (recipientType === "multiple-users" && userIds?.length) {
    filter._id = { $in: userIds };
  } else if (recipientType === "all-customers") {
    filter.role = "customer";
  } else if (recipientType === "all-vendors") {
    filter.role = "vendor";
  } else if (recipientType === "all-delivery-partners") {
    filter.role = "delivery";
  } else if (recipientType === "all-users") {
    filter.role = { $in: ["customer", "vendor", "delivery", "admin"] };
  } else if (role) {
    filter.role = role;
  }

  const users = await User.find(filter).select("_id role").lean();
  const notifications = users.map((u) => ({
    user: u._id,
    title,
    message,
    type,
    priority,
    receiver: u.role,
  }));

  if (!notifications.length) {
    res.status(404);
    throw new Error("No recipients found");
  }

  await Notification.insertMany(notifications);

  users.forEach((user) => socketHandler.sendToUser(user._id, "notification", { title, message, type, priority, isRead: false }));

  sendSuccess(res, `Notification broadcasted to ${notifications.length} users successfully`);
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearNotifications, sendBroadcast };
