const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Review = require("../models/Review");

const updateProductReviewStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", averageRating: { $avg: "$rating" }, reviewsCount: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratings: stats[0]?.averageRating || 0,
    reviewsCount: stats[0]?.reviewsCount || 0,
  });
};

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reviews });
});

const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.product);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const review = await Review.create({
    user: req.user._id,
    product: req.body.product,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await updateProductReviewStats(product._id);
  res.status(201).json({ success: true, data: review });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  await updateProductReviewStats(review.product);
  res.json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    ...(req.user.role !== "admin" && { user: req.user._id }),
  });

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  const productId = review.product;
  await review.deleteOne();
  await updateProductReviewStats(productId);
  res.json({ success: true, message: "Review removed" });
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};
