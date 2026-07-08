const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");
const { sendSuccess } = require("../utils/responseHandler");

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await (await getOrCreateWishlist(req.user._id)).populate("products");
  sendSuccess(res, "Wishlist retrieved successfully", wishlist);
});

const addProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.product);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const wishlist = await getOrCreateWishlist(req.user._id);
  const exists = wishlist.products.some((item) => item.toString() === product._id.toString());

  if (!exists) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }

  sendSuccess(res, "Product added to wishlist", await wishlist.populate("products"), 201);
});

const removeProduct = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();
  sendSuccess(res, "Product removed from wishlist", await wishlist.populate("products"));
});

const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = [];
  await wishlist.save();
  sendSuccess(res, "Wishlist cleared successfully");
});

module.exports = { getWishlist, addProduct, removeProduct, clearWishlist };
