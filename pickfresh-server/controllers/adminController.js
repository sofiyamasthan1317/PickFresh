const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Coupon = require("../models/Coupon");
const { sendSuccess } = require("../utils/responseHandler");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeUser = (u) => {
  const obj = u.toObject ? u.toObject() : u;
  delete obj.password; delete obj.otp; delete obj.otpExpiry;
  delete obj.otpPurpose; delete obj.refreshToken;
  return obj;
};

const sel = "-password -otp -otpExpiry -otpPurpose -refreshToken";

// ─── Dashboard ────────────────────────────────────────────────────────────────

const getAdminDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalCustomers, totalVendors, totalDelivery, totalAdmins,
    totalProducts, totalCategories,
    totalOrders, pendingOrders, confirmedOrders, deliveredOrders, cancelledOrders,
    revenueData, monthlyRevenue, lastMonthRevenue,
    todaySalesData,
    recentOrders, recentUsers, lowStock,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "delivery" }),
    User.countDocuments({ role: "admin" }),
    Product.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "Pending" }),
    Order.countDocuments({ orderStatus: "Confirmed" }),
    Order.countDocuments({ orderStatus: "Delivered" }),
    Order.countDocuments({ orderStatus: "Cancelled" }),
    Order.aggregate([{ $match: { paymentStatus: "Paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { paymentStatus: "Paid", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { paymentStatus: "Paid", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { paymentStatus: "Paid", createdAt: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email").populate("shippingAddress"),
    User.find().sort({ createdAt: -1 }).limit(8).select("name email role createdAt avatar isEmailVerified"),
    Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(8).populate("category", "name"),
  ]);

  const salesTrend = await Order.aggregate([
    { $match: { paymentStatus: "Paid", createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const revenue = revenueData[0]?.total || 0;
  const thisMonth = monthlyRevenue[0]?.total || 0;
  const lastMonth = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : 0;
  
  const todayRevenue = todaySalesData[0]?.total || 0;
  const todayCount = todaySalesData[0]?.count || 0;

  sendSuccess(res, "Admin dashboard metrics loaded successfully", {
    users: { total: totalCustomers + totalVendors + totalDelivery + totalAdmins, customers: totalCustomers, vendors: totalVendors, delivery: totalDelivery, admins: totalAdmins },
    products: totalProducts,
    categories: totalCategories,
    orders: { total: totalOrders, pending: pendingOrders, confirmed: confirmedOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
    revenue: { total: revenue, thisMonth, lastMonth, growth: revenueGrowth },
    todaySales: { revenue: todayRevenue, count: todayCount },
    salesTrend,
    recentOrders,
    recentUsers: recentUsers.map(safeUser),
    lowStock,
  });
});

// ─── User Management ──────────────────────────────────────────────────────────

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, isBlocked, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === "true";
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];

  const skip = (Math.max(Number(page), 1) - 1) * Math.min(Number(limit), 100);
  const [users, total] = await Promise.all([
    User.find(filter).select(sel).sort({ createdAt: -1 }).skip(skip).limit(Math.min(Number(limit), 100)),
    User.countDocuments(filter),
  ]);
  sendSuccess(res, "Users retrieved successfully", users, 200, { pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(sel);
  if (!user) { res.status(404); throw new Error("User not found"); }
  const [orders, totalSpent] = await Promise.all([
    Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
    Order.aggregate([{ $match: { user: user._id, paymentStatus: "Paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
  ]);
  sendSuccess(res, "User loaded successfully", { ...user.toObject(), recentOrders: orders, totalSpent: totalSpent[0]?.total || 0 });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, isBlocked, isEmailVerified } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { name, phone, role, isBlocked, isEmailVerified }, { new: true, runValidators: true }).select(sel);
  if (!user) { res.status(404); throw new Error("User not found"); }
  sendSuccess(res, "User updated successfully", user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  await user.deleteOne();
  sendSuccess(res, "User deleted successfully");
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select(sel);
  if (!user) { res.status(404); throw new Error("User not found"); }
  sendSuccess(res, "User blocked successfully", user);
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select(sel);
  if (!user) { res.status(404); throw new Error("User not found"); }
  sendSuccess(res, "User unblocked successfully", user);
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["customer", "vendor", "admin", "delivery"].includes(role)) { res.status(400); throw new Error("Invalid role"); }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(sel);
  if (!user) { res.status(404); throw new Error("User not found"); }
  sendSuccess(res, "User role updated successfully", user);
});

// ─── Vendor Management ────────────────────────────────────────────────────────

const getVendors = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = { role: "vendor" };
  if (status) filter.vendorStatus = status;
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  const skip = (Math.max(Number(page), 1) - 1) * Math.min(Number(limit), 100);
  const [vendors, total] = await Promise.all([
    User.find(filter).select(sel).sort({ createdAt: -1 }).skip(skip).limit(Math.min(Number(limit), 100)),
    User.countDocuments(filter),
  ]);
  sendSuccess(res, "Vendors retrieved successfully", vendors, 200, { pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findOneAndUpdate({ _id: req.params.id, role: "vendor" }, { vendorStatus: "approved" }, { new: true }).select(sel);
  if (!vendor) { res.status(404); throw new Error("Vendor not found"); }
  await Notification.create({ user: vendor._id, title: "Application Approved 🎉", message: "Your vendor application has been approved. You can now list products.", type: "admin" });
  sendSuccess(res, "Vendor approved successfully", vendor);
});

const rejectVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findOneAndUpdate({ _id: req.params.id, role: "vendor" }, { vendorStatus: "rejected" }, { new: true }).select(sel);
  if (!vendor) { res.status(404); throw new Error("Vendor not found"); }
  await Notification.create({ user: vendor._id, title: "Application Rejected 🛑", message: "Your vendor application has been reviewed and rejected.", type: "admin" });
  sendSuccess(res, "Vendor rejected successfully", vendor);
});

const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findOneAndUpdate({ _id: req.params.id, role: "vendor" }, { vendorStatus: "suspended" }, { new: true }).select(sel);
  if (!vendor) { res.status(404); throw new Error("Vendor not found"); }
  sendSuccess(res, "Vendor suspended successfully", vendor);
});

const activateVendor = asyncHandler(async (req, res) => {
  const vendor = await User.findOneAndUpdate({ _id: req.params.id, role: "vendor" }, { vendorStatus: "approved" }, { new: true }).select(sel);
  if (!vendor) { res.status(404); throw new Error("Vendor not found"); }
  await Notification.create({ user: vendor._id, title: "Account Activated ⚡", message: "Your vendor account has been reactivated.", type: "admin" });
  sendSuccess(res, "Vendor activated successfully", vendor);
});

const getVendorProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendor: req.params.id }).populate("category", "name").sort({ createdAt: -1 }).lean();
  sendSuccess(res, "Vendor products loaded successfully", products);
});

const getVendorOrders = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendor: req.params.id }).select("_id").lean();
  const productIds = products.map((p) => p._id);
  const orders = await Order.find({ "products.product": { $in: productIds } }).populate("user", "name email").sort({ createdAt: -1 }).limit(50).lean();
  sendSuccess(res, "Vendor orders loaded successfully", orders);
});

// ─── Delivery Management ──────────────────────────────────────────────────────

const getDeliveryPartners = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { role: "delivery" };
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  const [partners, total] = await Promise.all([
    User.find(filter).select(sel).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  sendSuccess(res, "Delivery partners loaded successfully", partners, 200, { pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const suspendDeliveryPartner = asyncHandler(async (req, res) => {
  const partner = await User.findOneAndUpdate({ _id: req.params.id, role: "delivery" }, { isBlocked: true }, { new: true }).select(sel);
  if (!partner) { res.status(404); throw new Error("Delivery partner not found"); }
  sendSuccess(res, "Delivery partner suspended successfully", partner);
});

const activateDeliveryPartner = asyncHandler(async (req, res) => {
  const partner = await User.findOneAndUpdate({ _id: req.params.id, role: "delivery" }, { isBlocked: false }, { new: true }).select(sel);
  if (!partner) { res.status(404); throw new Error("Delivery partner not found"); }
  sendSuccess(res, "Delivery partner activated successfully", partner);
});

const getDeliveryPartnerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ assignedTo: req.params.id })
    .populate("user", "name email")
    .populate("shippingAddress")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  sendSuccess(res, "Delivery partner orders loaded successfully", orders);
});

const getDeliveryPerformance = asyncHandler(async (req, res) => {
  const partnerId = new mongoose.Types.ObjectId(req.params.id);
  const [total, delivered, cancelled] = await Promise.all([
    Order.countDocuments({ assignedTo: partnerId }),
    Order.countDocuments({ assignedTo: partnerId, orderStatus: "Delivered" }),
    Order.countDocuments({ assignedTo: partnerId, orderStatus: "Cancelled" }),
  ]);
  const rate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;
  sendSuccess(res, "Delivery performance metrics loaded successfully", { total, delivered, cancelled, successRate: rate });
});

const assignDelivery = asyncHandler(async (req, res) => {
  const { deliveryPartnerId } = req.body;
  const partner = await User.findOne({ _id: deliveryPartnerId, role: "delivery" });
  if (!partner) { res.status(404); throw new Error("Delivery partner not found"); }
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (!["Confirmed", "Packed"].includes(order.orderStatus)) { res.status(400); throw new Error("Order must be Confirmed or Packed before assigning delivery"); }
  order.assignedTo = deliveryPartnerId;
  order.orderStatus = "Shipped";
  order.statusHistory.push({ status: "Shipped", note: `Assigned to ${partner.name}` });
  await order.save();
  await Notification.create({ user: deliveryPartnerId, title: "New Delivery Assigned 🚚", message: `Order ${order.orderId} has been assigned to you.`, type: "delivery", refId: order.orderId });
  sendSuccess(res, "Delivery partner assigned successfully", order);
});

// ─── Product Bulk Actions ─────────────────────────────────────────────────────

const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { ids, update } = req.body;
  if (!Array.isArray(ids) || !ids.length) { res.status(400); throw new Error("Product IDs required"); }
  const allowedFields = ["isFeatured", "isTrending", "isBestSeller", "isOrganic", "isNewArrival", "isAvailable"];
  const safeUpdate = Object.fromEntries(Object.entries(update).filter(([k]) => allowedFields.includes(k)));
  const result = await Product.updateMany({ _id: { $in: ids } }, safeUpdate);
  sendSuccess(res, `${result.modifiedCount} products updated successfully`);
});

const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) { res.status(400); throw new Error("Product IDs required"); }
  const result = await Product.deleteMany({ _id: { $in: ids } });
  sendSuccess(res, `${result.deletedCount} products deleted successfully`);
});

// ─── Review Moderation ────────────────────────────────────────────────────────

const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isFlagged } = req.query;
  const filter = {};
  if (isFlagged !== undefined) filter.isFlagged = isFlagged === "true";
  const skip = (Number(page) - 1) * Number(limit);
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate("user", "name avatar").populate("product", "name images").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Review.countDocuments(filter),
  ]);
  sendSuccess(res, "Reviews retrieved successfully", reviews, 200, { pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

const hideReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
  if (!review) { res.status(404); throw new Error("Review not found"); }
  sendSuccess(res, "Review hidden successfully", review);
});

const showReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: false }, { new: true });
  if (!review) { res.status(404); throw new Error("Review not found"); }
  sendSuccess(res, "Review shown successfully", review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) { res.status(404); throw new Error("Review not found"); }
  sendSuccess(res, "Review deleted successfully");
});

// ─── Reports ──────────────────────────────────────────────────────────────────

const getSalesReport = asyncHandler(async (req, res) => {
  const { from, to, groupBy = "day" } = req.query;
  const match = { paymentStatus: "Paid" };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  const groupFormats = {
    day: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
    month: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
    year: { year: { $year: "$createdAt" } },
  };
  const data = await Order.aggregate([
    { $match: match },
    { $group: { _id: groupFormats[groupBy] || groupFormats.day, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 }, avgOrder: { $avg: "$totalAmount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);
  sendSuccess(res, "Sales report generated successfully", data);
});

const getRevenueReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = { paymentStatus: "Paid" };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  const [byMethod, byStatus, total] = await Promise.all([
    Order.aggregate([{ $match: match }, { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }, { $sort: { revenue: -1 } }]),
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: "$totalAmount" }, orders: { $sum: 1 }, avg: { $avg: "$totalAmount" } } }]),
  ]);
  sendSuccess(res, "Revenue report generated successfully", { total: total[0] || { total: 0, orders: 0, avg: 0 }, byPaymentMethod: byMethod, byStatus });
});

const getInventoryReport = asyncHandler(async (req, res) => {
  const [outOfStock, lowStock, total] = await Promise.all([
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
    Product.countDocuments(),
  ]);
  const byCategory = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, totalStock: { $sum: "$stock" }, avgPrice: { $avg: "$price" } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
    { $unwind: { path: "$category", preserveNullAndEmpty: true } },
    { $project: { categoryName: { $ifNull: ["$category.name", "Uncategorized"] }, count: 1, totalStock: 1, avgPrice: { $round: ["$avgPrice", 0] } } },
  ]);
  sendSuccess(res, "Inventory report generated successfully", { total, outOfStock, lowStock, inStock: total - outOfStock, byCategory });
});

const getCustomerReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  const [total, verified, topCustomers] = await Promise.all([
    User.countDocuments({ role: "customer", ...match }),
    User.countDocuments({ role: "customer", isEmailVerified: true, ...match }),
    Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: "$user", totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: "$user.name", email: "$user.email", totalOrders: 1, totalSpent: 1 } },
    ]),
  ]);
  sendSuccess(res, "Customer report generated successfully", { total, verified, topCustomers });
});

const getVendorReport = asyncHandler(async (req, res) => {
  const topVendors = await Order.aggregate([
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": { $ne: null } } },
    { $group: { _id: "$prod.vendor", totalSold: { $sum: "$products.quantity" }, revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }, orders: { $addToSet: "$_id" } } },
    { $project: { totalSold: 1, revenue: 1, orderCount: { $size: "$orders" } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "vendor" } },
    { $unwind: "$vendor" },
    { $project: { name: "$vendor.name", email: "$vendor.email", businessName: "$vendor.businessName", totalSold: 1, revenue: 1, orderCount: 1 } },
  ]);
  sendSuccess(res, "Vendor report generated successfully", topVendors);
});

// ─── Notifications ────────────────────────────────────────────────────────────

const sendNotification = asyncHandler(async (req, res) => {
  const { userIds, role, title, message, type = "admin" } = req.body;
  let targetIds = userIds || [];
  if (role && !userIds?.length) {
    const users = await User.find({ role }).select("_id").lean();
    targetIds = users.map((u) => u._id);
  }
  if (!targetIds.length) { res.status(400); throw new Error("No target users specified"); }
  await Notification.insertMany(targetIds.map((userId) => ({ user: userId, title, message, type })));
  sendSuccess(res, `Notification sent to ${targetIds.length} users successfully`);
});

module.exports = {
  getAdminDashboard,
  getAllUsers, getUserById, updateUser, deleteUser, blockUser, unblockUser, changeUserRole,
  getVendors, approveVendor, rejectVendor, suspendVendor, activateVendor, getVendorProducts, getVendorOrders,
  getDeliveryPartners, suspendDeliveryPartner, activateDeliveryPartner, getDeliveryPartnerOrders, getDeliveryPerformance, assignDelivery,
  bulkUpdateProducts, bulkDeleteProducts,
  getAllReviews, hideReview, showReview, deleteReview,
  getSalesReport, getRevenueReport, getInventoryReport, getCustomerReport, getVendorReport,
  sendNotification,
};
