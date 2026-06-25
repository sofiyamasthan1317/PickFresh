const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  return wishlist;
};

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await (await getOrCreateWishlist(req.user._id)).populate("products");
  res.json({ success: true, data: wishlist });
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

  res.status(201).json({ success: true, data: await wishlist.populate("products") });
});

const removeProduct = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = wishlist.products.filter((product) => product.toString() !== req.params.productId);
  await wishlist.save();
  res.json({ success: true, data: await wishlist.populate("products") });
});

module.exports = {
  getWishlist,
  addProduct,
  removeProduct,
};
