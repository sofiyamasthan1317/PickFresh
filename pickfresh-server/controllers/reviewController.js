const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Review = require("../models/Review");

const updateProductReviewStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isHidden: false } },
    { $group: { _id: "$product", averageRating: { $avg: "$rating" }, reviewsCount: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratings: stats[0]?.averageRating ? Math.round(stats[0].averageRating * 10) / 10 : 0,
    reviewsCount: stats[0]?.reviewsCount || 0,
  });
};

// GET /api/reviews/product/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "newest" } = req.query;
  const numericPage = Math.max(Number(page), 1);
  const numericLimit = Math.min(Math.max(Number(limit), 1), 50);
  const sortOptions = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, highestRated: { rating: -1 } };

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isHidden: false })
      .populate("user", "name avatar")
      .populate("reply.repliedBy", "name")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    Review.countDocuments({ product: req.params.productId, isHidden: false }),
  ]);

  res.json({ success: true, data: reviews, pagination: { total, page: numericPage, pages: Math.ceil(total / numericLimit), limit: numericLimit } });
});

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.product);
  if (!product) { res.status(404); throw new Error("Product not found"); }

  const existing = await Review.findOne({ user: req.user._id, product: req.body.product });
  if (existing) { res.status(409); throw new Error("You have already reviewed this product"); }

  const review = await Review.create({ user: req.user._id, product: req.body.product, rating: req.body.rating, comment: req.body.comment || "" });
  await updateProductReviewStats(product._id);
  const populated = await review.populate("user", "name avatar");
  res.status(201).json({ success: true, data: populated });
});

// PUT /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { rating: req.body.rating, comment: req.body.comment },
    { new: true, runValidators: true }
  );
  if (!review) { res.status(404); throw new Error("Review not found"); }
  await updateProductReviewStats(review.product);
  res.json({ success: true, data: review });
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, ...(req.user.role !== "admin" && { user: req.user._id }) });
  if (!review) { res.status(404); throw new Error("Review not found"); }
  const productId = review.product;
  await review.deleteOne();
  await updateProductReviewStats(productId);
  res.json({ success: true, message: "Review removed" });
});

// POST /api/reviews/:id/like
const likeReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error("Review not found"); }

  const userId = req.user._id.toString();
  const alreadyLiked = review.likes.map((l) => l.toString()).includes(userId);
  if (alreadyLiked) review.likes = review.likes.filter((l) => l.toString() !== userId);
  else review.likes.push(req.user._id);

  await review.save();
  res.json({ success: true, message: alreadyLiked ? "Like removed" : "Review liked", data: { likes: review.likes.length } });
});

// POST /api/reviews/:id/flag
const flagReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isFlagged: true }, { new: true });
  if (!review) { res.status(404); throw new Error("Review not found"); }
  res.json({ success: true, message: "Review flagged for moderation" });
});

module.exports = { getProductReviews, createReview, updateReview, deleteReview, likeReview, flagReview };
