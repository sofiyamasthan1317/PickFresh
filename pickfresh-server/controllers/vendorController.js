const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Category = require("../models/Category");
const Notification = require("../models/Notification");
const User = require("../models/UserModel");
const { sendSuccess } = require("../utils/responseHandler");

// ─── Dashboard ────────────────────────────────────────────────────────────────

// GET /api/vendor/dashboard
const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalProducts, outOfStock, lowStock] = await Promise.all([
    Product.countDocuments({ vendor: vendorId }),
    Product.countDocuments({ vendor: vendorId, stock: 0 }),
    Product.find({ vendor: vendorId, stock: { $gt: 0, $lte: 10 } }).populate("category", "name").limit(5),
  ]);

  const revenueData = await Order.aggregate([
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": vendorId, paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
  ]);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "Paid", createdAt: { $gte: startOfMonth } } },
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": vendorId } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
  ]);

  const todayOrders = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfToday } } },
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": vendorId } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": vendorId } },
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  const salesTrend = await Order.aggregate([
    { $match: { paymentStatus: "Paid", createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": vendorId } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }, orders: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const recentReviews = await Review.find()
    .populate({ path: "product", match: { vendor: vendorId }, select: "name images" })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .limit(5)
    .then((reviews) => reviews.filter((r) => r.product));

  res.json({
    success: true,
    data: {
      products: { total: totalProducts, outOfStock, lowStock },
      revenue: { total: revenueData[0]?.total || 0, thisMonth: monthlyRevenue[0]?.total || 0 },
      orders: { today: todayOrders[0]?.count || 0, byStatus: ordersByStatus },
      salesTrend,
      recentReviews,
    },
  });
});

// ─── Products ─────────────────────────────────────────────────────────────────

// GET /api/vendor/products
const getMyProducts = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 20 } = req.query;
  const filter = { vendor: req.user._id };
  if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { brand: { $regex: search, $options: "i" } }];
  if (category) filter.category = category;
  if (status === "active") filter.isAvailable = true;
  if (status === "outofstock") filter.stock = 0;
  if (status === "lowstock") { filter.stock = { $gt: 0, $lte: 10 }; }

  const skip = (Math.max(Number(page), 1) - 1) * Math.min(Number(limit), 100);
  const [products, total] = await Promise.all([
    Product.find(filter).populate("category", "name").sort({ createdAt: -1 }).skip(skip).limit(Math.min(Number(limit), 100)),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: products, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

// POST /api/vendor/products
const createMyProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) { res.status(404); throw new Error("Category not found"); }

  const product = await Product.create({
    ...req.body,
    vendor: req.user._id,
    createdBy: req.user._id,
    images: req.files?.length ? req.files.map((f) => `/uploads/${f.filename}`) : req.body.images || [],
  });
  res.status(201).json({ success: true, data: product });
});

// PUT /api/vendor/products/:id
const updateMyProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id });
  if (!product) { res.status(404); throw new Error("Product not found or access denied"); }

  const updated = await Product.findByIdAndUpdate(req.params.id, {
    ...req.body,
    ...(req.files?.length && { images: req.files.map((f) => `/uploads/${f.filename}`) }),
  }, { new: true, runValidators: true }).populate("category", "name");
  res.json({ success: true, data: updated });
});

// DELETE /api/vendor/products/:id
const deleteMyProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, vendor: req.user._id });
  if (!product) { res.status(404); throw new Error("Product not found or access denied"); }
  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

// PATCH /api/vendor/products/:id/stock
const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  if (stock < 0) { res.status(400); throw new Error("Stock cannot be negative"); }
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, vendor: req.user._id },
    { stock, isAvailable: stock > 0 },
    { new: true }
  );
  if (!product) { res.status(404); throw new Error("Product not found or access denied"); }
  res.json({ success: true, data: product });
});

// PATCH /api/vendor/products/bulk-stock
const bulkUpdateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body; // [{ id, stock }]
  if (!Array.isArray(updates) || !updates.length) { res.status(400); throw new Error("Updates array required"); }

  const ops = updates.map(({ id, stock }) => ({
    updateOne: { filter: { _id: id, vendor: req.user._id }, update: { stock: Math.max(0, Number(stock)), isAvailable: Number(stock) > 0 } },
  }));
  const result = await Product.bulkWrite(ops);
  res.json({ success: true, message: `${result.modifiedCount} products updated` });
});

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET /api/vendor/orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const myProducts = await Product.find({ vendor: req.user._id }).select("_id");
  const productIds = myProducts.map((p) => p._id);

  const filter = { "products.product": { $in: productIds } };
  if (status) filter.orderStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "name email phone").populate("shippingAddress").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

// PATCH /api/vendor/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, note } = req.body;
  const allowed = ["Confirmed", "Packed", "Shipped"];
  if (!allowed.includes(orderStatus)) { res.status(400); throw new Error(`Vendor can only set: ${allowed.join(", ")}`); }

  const myProducts = await Product.find({ vendor: req.user._id }).select("_id");
  const productIds = myProducts.map((p) => p._id.toString());

  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }

  const hasVendorProduct = order.products.some((p) => productIds.includes(p.product.toString()));
  if (!hasVendorProduct) { res.status(403); throw new Error("Access denied"); }

  order.orderStatus = orderStatus;
  order.statusHistory.push({ status: orderStatus, note: note || "" });
  await order.save();

  await Notification.create({ user: order.user, title: `Order ${orderStatus}`, message: `Your order ${order.orderId} is now ${orderStatus}.`, type: "order", refId: order.orderId });
  res.json({ success: true, data: order });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

// GET /api/vendor/reviews
const getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const myProducts = await Product.find({ vendor: req.user._id }).select("_id");
  const productIds = myProducts.map((p) => p._id);

  const skip = (Number(page) - 1) * Number(limit);
  const [reviews, total] = await Promise.all([
    Review.find({ product: { $in: productIds }, isHidden: false })
      .populate("user", "name avatar")
      .populate("product", "name images")
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Review.countDocuments({ product: { $in: productIds }, isHidden: false }),
  ]);

  const ratingStats = await Review.aggregate([
    { $match: { product: { $in: productIds } } },
    { $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } },
  ]);

  res.json({ success: true, data: reviews, stats: { avg: ratingStats[0]?.avg?.toFixed(1) || 0, total: ratingStats[0]?.total || 0 }, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
});

// POST /api/vendor/reviews/:id/reply
const replyToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const myProducts = await Product.find({ vendor: req.user._id }).select("_id");
  const productIds = myProducts.map((p) => p._id.toString());

  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error("Review not found"); }
  if (!productIds.includes(review.product.toString())) { res.status(403); throw new Error("Access denied"); }

  review.reply = { text, repliedBy: req.user._id, repliedAt: new Date() };
  await review.save();
  res.json({ success: true, data: review });
});

// ─── Analytics ────────────────────────────────────────────────────────────────

// GET /api/vendor/analytics
const getMyAnalytics = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const now = new Date();

  const salesTrend = await Order.aggregate([
    { $match: { paymentStatus: "Paid", createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": vendorId } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }, units: { $sum: "$products.quantity" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: "$products" },
    { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
    { $unwind: "$prod" },
    { $match: { "prod.vendor": vendorId } },
    { $group: { _id: "$products.product", name: { $first: "$products.name" }, totalSold: { $sum: "$products.quantity" }, revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  res.json({ success: true, data: { salesTrend, topProducts } });
});

// ─── Earnings ─────────────────────────────────────────────────────────────────

// GET /api/vendor/earnings
const getMyEarnings = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalEarnings, monthlyEarnings, monthlyBreakdown] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $unwind: "$products" },
      { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vendorId } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: startOfMonth } } },
      { $unwind: "$products" },
      { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vendorId } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
      { $unwind: "$products" },
      { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "prod" } },
      { $unwind: "$prod" },
      { $match: { "prod.vendor": vendorId } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, earned: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      total: totalEarnings[0]?.total || 0,
      thisMonth: monthlyEarnings[0]?.total || 0,
      monthlyBreakdown,
    },
  });
});

// ─── Profile ──────────────────────────────────────────────────────────────────

// GET /api/vendor/profile
const getVendorProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -otp -otpExpiry -otpPurpose -refreshToken");
  if (!user) { res.status(404); throw new Error("Vendor not found"); }
  sendSuccess(res, "Vendor profile loaded successfully", user);
});

// PUT /api/vendor/profile
const updateVendorProfile = asyncHandler(async (req, res) => {
  const { storeName, ownerName, phone, businessName, businessAddress, city, state, pincode, gstNumber, fssaiNumber, businessDescription } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 
      ...(storeName !== undefined && { storeName }),
      ...(ownerName !== undefined && { name: ownerName }),
      ...(phone !== undefined && { phone }),
      ...(businessName !== undefined && { businessName }),
      ...(businessAddress !== undefined && { businessAddress }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
      ...(gstNumber !== undefined && { gstNumber }),
      ...(fssaiNumber !== undefined && { fssaiNumber }),
      ...(businessDescription !== undefined && { businessDescription }),
    },
    { new: true, runValidators: true }
  ).select("-password -otp -otpExpiry -otpPurpose -refreshToken");
  if (!user) { res.status(404); throw new Error("Vendor not found"); }
  sendSuccess(res, "Vendor profile updated successfully", user);
});

// PATCH /api/vendor/profile/logo
const updateVendorLogo = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error("Logo image is required"); }
  const logoUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { shopLogo: logoUrl }, { new: true }).select("-password -otp -otpExpiry -otpPurpose -refreshToken");
  sendSuccess(res, "Shop logo updated successfully", { shopLogo: user.shopLogo });
});

// PATCH /api/vendor/profile/cover
const updateVendorCover = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error("Cover image is required"); }
  const coverUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { coverImage: coverUrl }, { new: true }).select("-password -otp -otpExpiry -otpPurpose -refreshToken");
  sendSuccess(res, "Cover image updated successfully", { coverImage: user.coverImage });
});

module.exports = {
  getVendorDashboard,
  getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct, updateStock, bulkUpdateStock,
  getMyOrders, updateOrderStatus,
  getMyReviews, replyToReview,
  getMyAnalytics,
  getMyEarnings,
  getVendorProfile, updateVendorProfile, updateVendorLogo, updateVendorCover,
};
