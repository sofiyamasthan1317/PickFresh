const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const Coupon = require("../models/Coupon");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const { sendSuccess } = require("../utils/responseHandler");

const generateOrderId = () => `PF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const buildOrderProducts = async (items) => {
  const orderProducts = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    const quantity = Number(item.quantity);

    if (!product || !product.isAvailable) {
      throw new Error(`Product unavailable: ${item.product}`);
    }

    if (product.stock < quantity) {
      throw new Error(`${product.name} has only ${product.stock} ${product.unit} available`);
    }

    orderProducts.push({
      product: product._id,
      name: product.name,
      quantity,
      price: product.offerPrice ?? product.price,
      image: product.images?.[0] || null,
    });
  }

  return orderProducts;
};

// Helper to get or create a user's wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  return wallet;
};

// GET /api/orders
const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };

  if (status) filter.orderStatus = status;

  const numericPage = Math.max(Number(page), 1);
  const numericLimit = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (numericPage - 1) * numericLimit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .populate("shippingAddress")
      .populate("products.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, "Orders retrieved successfully", orders, 200, {
    pagination: { total, page: numericPage, pages: Math.ceil(total / numericLimit), limit: numericLimit }
  });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const idFilter = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
    : { orderId: req.params.id };

  const filter = { ...idFilter };
  if (req.user.role !== "admin") filter.user = req.user._id;

  const order = await Order.findOne(filter)
    .populate("user", "name email phone")
    .populate("shippingAddress")
    .populate("products.product", "name images")
    .populate("assignedTo", "name phone");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  sendSuccess(res, "Order loaded successfully", order);
});

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "COD", products, deliveryCharge = 0, tax = 0, couponCode } = req.body;

  const address = await Address.findOne({ _id: shippingAddress, user: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error("Shipping address not found");
  }

  let orderItems = products;
  if (!orderItems || orderItems.length === 0) {
    const cart = await Cart.findOne({ user: req.user._id });
    orderItems = cart?.items || [];
  }

  if (!orderItems.length) {
    res.status(400);
    throw new Error("Order must contain at least one product");
  }

  const orderProducts = await buildOrderProducts(orderItems);
  const subtotal = orderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Server-side Coupon validation & discount calculation
  let calculatedDiscount = 0;
  let activeCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
      res.status(400);
      throw new Error("Coupon is invalid or expired");
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      res.status(400);
      throw new Error("Coupon usage limit reached");
    }
    if (subtotal < coupon.minimumAmount) {
      res.status(400);
      throw new Error(`Minimum order amount for this coupon is ₹${coupon.minimumAmount}`);
    }

    // Check duplicate usage per user
    const alreadyUsed = await Order.findOne({
      user: req.user._id,
      couponCode: couponCode.toUpperCase(),
      paymentStatus: { $ne: "Failed" },
      orderStatus: { $ne: "Cancelled" }
    });

    if (alreadyUsed) {
      res.status(400);
      throw new Error("You have already used this coupon");
    }

    if (coupon.discountType === "percentage") {
      calculatedDiscount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);
    } else {
      calculatedDiscount = coupon.discountValue;
    }
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);
    activeCoupon = coupon;
  }

  const totalAmount = Math.max(subtotal + Number(deliveryCharge) + Number(tax) - calculatedDiscount, 0);

  // If Wallet payment method chosen, verify and deduct balance
  let wallet = null;
  if (paymentMethod === "Wallet") {
    wallet = await getOrCreateWallet(req.user._id);
    if (wallet.balance < totalAmount) {
      res.status(400);
      throw new Error(`Insufficient wallet balance. Total is ₹${totalAmount.toFixed(2)}, balance is ₹${wallet.balance.toFixed(2)}.`);
    }
  }

  const order = await Order.create({
    orderId: generateOrderId(),
    user: req.user._id,
    products: orderProducts,
    shippingAddress,
    paymentMethod,
    subtotal,
    deliveryCharge,
    tax,
    discount: calculatedDiscount,
    totalAmount,
    couponCode: couponCode ? couponCode.toUpperCase() : null,
    statusHistory: [{ status: "Pending", note: "Order placed" }],
  });

  // Perform wallet deduction if applicable
  if (paymentMethod === "Wallet" && wallet) {
    wallet.balance -= totalAmount;
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      user: req.user._id,
      type: "payment",
      amount: totalAmount,
      description: `Payment for order ${order.orderId}`,
      status: "completed",
      order: order._id,
    });

    order.paymentStatus = "Paid";
    order.orderStatus = "Confirmed"; // Auto confirm wallet-paid orders
    order.statusHistory.push({ status: "Confirmed", note: "Paid via PickFresh Wallet" });
    await order.save();
  }

  // Increment coupon usage count
  if (activeCoupon) {
    activeCoupon.usedCount += 1;
    await activeCoupon.save();
  }

  // Decrement stock
  await Product.bulkWrite(
    orderProducts.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: [
          {
            $set: {
              stock: { $max: [{ $subtract: ["$stock", item.quantity] }, 0] },
              isAvailable: { $gt: [{ $subtract: ["$stock", item.quantity] }, 0] },
            },
          },
        ],
      },
    }))
  );

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], subtotal: 0, grandTotal: 0 });

  // Notify user
  await Notification.create({
    user: req.user._id,
    title: "Order Placed 📦",
    message: `Your order ${order.orderId} has been placed successfully.`,
    type: "order",
    refId: order.orderId,
  });

  sendSuccess(res, "Order created successfully", order, 201);
});

// PUT /api/orders/:id  (admin)
const updateOrder = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, note: note || "" });

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "COD") order.paymentStatus = "Paid";

      await Notification.create({
        user: order.user,
        title: "Order Delivered 🧺",
        message: `Your order ${order.orderId} has been delivered.`,
        type: "order",
        refId: order.orderId,
      });
    }
  }

  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();
  sendSuccess(res, "Order updated successfully", order);
});

// POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };

  const order = await Order.findOne(filter);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const nonCancellable = ["Shipped", "Out For Delivery", "Delivered", "Cancelled", "Returned"];
  if (nonCancellable.includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Cannot cancel an order with status: ${order.orderStatus}`);
  }

  // Restore stock
  await Product.bulkWrite(
    order.products.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity }, $set: { isAvailable: true } },
      },
    }))
  );

  // Refund to wallet if order was paid
  if (order.paymentStatus === "Paid") {
    const wallet = await getOrCreateWallet(order.user);
    wallet.balance += order.totalAmount;
    await wallet.save();

    await WalletTransaction.create({
      wallet: wallet._id,
      user: order.user,
      type: "refund",
      amount: order.totalAmount,
      description: `Refund for cancelled order ${order.orderId}`,
      status: "completed",
      order: order._id,
    });
  }

  order.orderStatus = "Cancelled";
  order.cancelReason = reason || null;
  order.statusHistory.push({ status: "Cancelled", note: reason || "Cancelled by user" });
  await order.save();

  await Notification.create({
    user: order.user,
    title: "Order Cancelled 🛑",
    message: `Your order ${order.orderId} has been cancelled.`,
    type: "order",
    refId: order.orderId,
  });

  sendSuccess(res, "Order cancelled successfully", order);
});

// GET /api/orders/:id/invoice
const getInvoice = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };

  const order = await Order.findOne(filter)
    .populate("user", "name email phone")
    .populate("shippingAddress");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  sendSuccess(res, "Invoice retrieved successfully", {
    invoiceNumber: `INV-${order.orderId}`,
    orderId: order.orderId,
    date: order.createdAt,
    customer: order.user,
    shippingAddress: order.shippingAddress,
    products: order.products,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    tax: order.tax,
    discount: order.discount,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
  });
});

// DELETE /api/orders/:id (admin)
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();
  sendSuccess(res, "Order removed successfully");
});

module.exports = { getOrders, getOrderById, createOrder, updateOrder, cancelOrder, getInvoice, deleteOrder };
