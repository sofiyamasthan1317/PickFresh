const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const User = require("../models/UserModel");
const Notification = require("../models/Notification");

// ─── Admin: assign order ──────────────────────────────────────────────────────
const assignDelivery = asyncHandler(async (req, res) => {
  const { deliveryPartnerId } = req.body;

  const partner = await User.findOne({ _id: deliveryPartnerId, role: "delivery" });
  if (!partner) { res.status(404); throw new Error("Delivery partner not found"); }

  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (!["Packed", "Shipped", "Confirmed"].includes(order.orderStatus)) {
    res.status(400); throw new Error("Order must be Confirmed, Packed or Shipped before assigning");
  }

  order.assignedTo = deliveryPartnerId;
  order.orderStatus = "Shipped";
  order.statusHistory.push({ status: "Shipped", note: `Assigned to ${partner.name}` });
  await order.save();

  await Notification.create({ user: deliveryPartnerId, title: "New Delivery Assigned", message: `Order ${order.orderId} has been assigned to you.`, type: "delivery", refId: order.orderId });
  res.json({ success: true, message: "Delivery partner assigned", data: order });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
const getDeliveryDashboard = asyncHandler(async (req, res) => {
  const partnerId = req.user._id;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [assigned, completed, inProgress, todayDelivered, monthDelivered, recentAssigned] = await Promise.all([
    Order.countDocuments({ assignedTo: partnerId }),
    Order.countDocuments({ assignedTo: partnerId, orderStatus: "Delivered" }),
    Order.countDocuments({ assignedTo: partnerId, orderStatus: "Out For Delivery" }),
    Order.countDocuments({ assignedTo: partnerId, orderStatus: "Delivered", deliveredAt: { $gte: startOfToday } }),
    Order.countDocuments({ assignedTo: partnerId, orderStatus: "Delivered", deliveredAt: { $gte: startOfMonth } }),
    Order.find({ assignedTo: partnerId, orderStatus: { $in: ["Shipped", "Out For Delivery"] } })
      .sort({ updatedAt: -1 }).limit(5).populate("user", "name phone").populate("shippingAddress"),
  ]);

  // ₹50 per delivery as flat rate
  const todayEarnings = todayDelivered * 50;
  const monthEarnings = monthDelivered * 50;

  res.json({
    success: true,
    data: {
      assigned, completed, inProgress,
      todayDeliveries: todayDelivered,
      earnings: { today: todayEarnings, thisMonth: monthEarnings, perDelivery: 50 },
      recentAssigned,
    },
  });
});

// ─── My assigned deliveries ───────────────────────────────────────────────────
const getMyDeliveries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { assignedTo: req.user._id };
  if (status) filter.orderStatus = status;

  const orders = await Order.find(filter)
    .sort({ updatedAt: -1 })
    .populate("user", "name phone")
    .populate("shippingAddress");

  res.json({ success: true, data: orders });
});

// ─── Update delivery status ───────────────────────────────────────────────────
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { orderStatus, note } = req.body;
  const allowed = ["Out For Delivery", "Delivered"];

  if (!allowed.includes(orderStatus)) {
    res.status(400); throw new Error("Delivery partner can only set Out For Delivery or Delivered");
  }

  const order = await Order.findOne({ _id: req.params.id, assignedTo: req.user._id });
  if (!order) { res.status(404); throw new Error("Order not found or not assigned to you"); }

  order.orderStatus = orderStatus;
  order.statusHistory.push({ status: orderStatus, note: note || "" });

  if (orderStatus === "Delivered") {
    order.paymentStatus = order.paymentMethod === "COD" ? "Paid" : order.paymentStatus;
    order.deliveredAt = new Date();

    await Notification.create({ user: order.user, title: "Order Delivered", message: `Your order ${order.orderId} has been delivered.`, type: "delivery", refId: order.orderId });
  }

  await order.save();
  res.json({ success: true, data: order });
});

// ─── Completed deliveries ─────────────────────────────────────────────────────
const getCompletedDeliveries = asyncHandler(async (req, res) => {
  const orders = await Order.find({ assignedTo: req.user._id, orderStatus: "Delivered" })
    .sort({ deliveredAt: -1 })
    .populate("user", "name phone")
    .populate("shippingAddress");

  res.json({ success: true, data: orders });
});

// ─── Earnings ─────────────────────────────────────────────────────────────────
const getMyEarnings = asyncHandler(async (req, res) => {
  const partnerId = req.user._id;
  const now = new Date();

  const monthlyBreakdown = await Order.aggregate([
    { $match: { assignedTo: partnerId, orderStatus: "Delivered", deliveredAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
    { $group: { _id: { year: { $year: "$deliveredAt" }, month: { $month: "$deliveredAt" } }, deliveries: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $project: { deliveries: 1, earned: { $multiply: ["$deliveries", 50] } } },
  ]);

  const totalDeliveries = await Order.countDocuments({ assignedTo: partnerId, orderStatus: "Delivered" });

  res.json({
    success: true,
    data: {
      totalDeliveries,
      totalEarned: totalDeliveries * 50,
      perDelivery: 50,
      monthlyBreakdown,
    },
  });
});

// ─── Profile update (vehicle info, availability) ──────────────────────────────
const updateDeliveryProfile = asyncHandler(async (req, res) => {
  const { vehicleType, vehicleNumber, phone } = req.body;
  const update = {};
  if (vehicleType !== undefined) update.vehicleType = vehicleType;
  if (vehicleNumber !== undefined) update.vehicleNumber = vehicleNumber;
  if (phone !== undefined) update.phone = phone;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password -otp -otpExpiry -otpPurpose -refreshToken");
  res.json({ success: true, data: user });
});

// ─── Toggle availability ──────────────────────────────────────────────────────
const toggleAvailability = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.isAvailable = !user.isAvailable;
  await user.save();
  res.json({ success: true, data: { isAvailable: user.isAvailable } });
});

module.exports = {
  assignDelivery,
  getDeliveryDashboard,
  getMyDeliveries,
  updateDeliveryStatus,
  getCompletedDeliveries,
  getMyEarnings,
  updateDeliveryProfile,
  toggleAvailability,
};
