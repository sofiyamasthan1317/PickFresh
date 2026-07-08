const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const Wishlist = require("../models/Wishlist");
const Address = require("../models/Address");

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    revenueData,
    topCategories,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "vendor" }),
    Product.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "Pending" }),
    Order.countDocuments({ orderStatus: "Delivered" }),
    Order.countDocuments({ orderStatus: "Cancelled" }),
    Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData._id",
          name: { $first: "$categoryData.name" },
          orders: { $sum: 1 },
          revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          name: { $first: "$products.name" },
          totalSold: { $sum: "$products.quantity" },
          revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
  ]);

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, vendors: totalVendors },
      products: totalProducts,
      categories: totalCategories,
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: revenueData[0]?.total || 0,
      topCategories,
      topProducts,
      recentOrders,
    },
  });
});

// ─── Vendor Dashboard ─────────────────────────────────────────────────────────

const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;

  const [totalProducts, outOfStock, revenueData, vendorOrders] = await Promise.all([
    Product.countDocuments({ vendor: vendorId }),
    Product.countDocuments({ vendor: vendorId, stock: 0 }),
    Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      { $match: { "productData.vendor": vendorId, paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
    ]),
    Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      { $match: { "productData.vendor": vendorId } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      products: { total: totalProducts, outOfStock },
      revenue: revenueData[0]?.total || 0,
      orders: vendorOrders,
    },
  });
});

// ─── Customer Dashboard ───────────────────────────────────────────────────────

const getCustomerDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalOrders, activeOrders, wishlist, addresses] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Order.countDocuments({ user: userId, orderStatus: { $nin: ["Delivered", "Cancelled", "Returned"] } }),
    Wishlist.findOne({ user: userId }),
    Address.countDocuments({ user: userId }),
  ]);

  res.json({
    success: true,
    data: {
      orders: { total: totalOrders, active: activeOrders },
      wishlistCount: wishlist?.products?.length || 0,
      addressCount: addresses,
    },
  });
});

// ─── Delivery Dashboard ───────────────────────────────────────────────────────

const getDeliveryDashboard = asyncHandler(async (req, res) => {
  const deliveryId = req.user._id;

  const [assigned, completed, inProgress] = await Promise.all([
    Order.countDocuments({ assignedTo: deliveryId }),
    Order.countDocuments({ assignedTo: deliveryId, orderStatus: "Delivered" }),
    Order.countDocuments({ assignedTo: deliveryId, orderStatus: "Out For Delivery" }),
  ]);

  const recentAssigned = await Order.find({ assignedTo: deliveryId })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate("user", "name phone")
    .populate("shippingAddress");

  res.json({
    success: true,
    data: {
      assigned,
      completed,
      inProgress,
      recentAssigned,
    },
  });
});

module.exports = {
  getAdminDashboard,
  getVendorDashboard,
  getCustomerDashboard,
  getDeliveryDashboard,
};
