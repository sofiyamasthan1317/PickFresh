const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const generateOrderId = () => `PF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const buildOrderProducts = async (items) => {
  const orderProducts = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    const quantity = Number(item.quantity);

    if (!product || !product.isAvailable) {
      throw new Error("One or more products are unavailable");
    }

    if (product.stock < quantity) {
      throw new Error(`${product.name} has only ${product.stock} ${product.unit} available`);
    }

    orderProducts.push({
      product: product._id,
      name: product.name,
      quantity,
      price: product.offerPrice ?? product.price,
    });
  }

  return orderProducts;
};

const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .populate("shippingAddress")
    .populate("products.product", "name images")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const idFilter = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
    : { orderId: req.params.id };
  const filter = { ...idFilter };
  if (req.user.role !== "admin") filter.user = req.user._id;

  const order = await Order.findOne(filter)
    .populate("user", "name email")
    .populate("shippingAddress")
    .populate("products.product", "name images");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({ success: true, data: order });
});

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "COD", products, deliveryCharge = 0, tax = 0, discount = 0 } = req.body;
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
  const totalAmount = Math.max(subtotal + Number(deliveryCharge) + Number(tax) - Number(discount), 0);

  const order = await Order.create({
    orderId: generateOrderId(),
    user: req.user._id,
    products: orderProducts,
    shippingAddress,
    paymentMethod,
    subtotal,
    deliveryCharge,
    tax,
    discount,
    totalAmount,
  });

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
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], subtotal: 0, grandTotal: 0 });

  res.status(201).json({ success: true, data: order });
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({ success: true, data: order });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();
  res.json({ success: true, message: "Order removed" });
});

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
