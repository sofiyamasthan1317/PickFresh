const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getProductReviews, createReview, updateReview, deleteReview, likeReview, flagReview } = require("../controllers/reviewController");

const router = express.Router();

router.get("/product/:productId", [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1 }),
  query("sort").optional().isIn(["newest", "oldest", "highestRated"]),
], validateRequest, getProductReviews);

router.post("/", protect, [
  body("product").isMongoId().withMessage("Valid product is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isString().trim(),
], validateRequest, createReview);

router.put("/:id", protect, [
  body("rating").optional().isInt({ min: 1, max: 5 }),
  body("comment").optional().isString().trim(),
], validateRequest, updateReview);

router.delete("/:id", protect, deleteReview);
router.post("/:id/like", protect, likeReview);
router.post("/:id/flag", protect, flagReview);

module.exports = router;
