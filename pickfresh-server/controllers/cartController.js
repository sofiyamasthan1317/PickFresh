const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const populateCart = (cart) => cart.populate("items.product", "name price offerPrice images stock unit isAvailable");

const getCart = asyncHandler(async (req, res) => {
  const cart = await populateCart(await getOrCreateCart(req.user._id));
  res.json({ success: true, data: cart });
});

const addItem = asyncHandler(async (req, res) => {
  const { product: productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);

  if (!product || !product.isAvailable) {
    res.status(404);
    throw new Error("Product not available");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  const price = product.offerPrice ?? product.price;

  if (existingItem) {
    existingItem.quantity += Number(quantity);
    existingItem.price = price;
  } else {
    cart.items.push({ product: productId, quantity, price });
  }

  cart.recalculateTotals();
  await cart.save();
  res.status(201).json({ success: true, data: await populateCart(cart) });
});

const updateQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((cartItem) => cartItem.product.toString() === req.params.productId);

  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  item.quantity = quantity;
  cart.recalculateTotals();
  await cart.save();
  res.json({ success: true, data: await populateCart(cart) });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  cart.recalculateTotals();
  await cart.save();
  res.json({ success: true, data: await populateCart(cart) });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.recalculateTotals();
  await cart.save();
  res.json({ success: true, data: cart });
});

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
};
