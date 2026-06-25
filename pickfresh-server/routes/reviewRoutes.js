const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.post(
  "/",
  protect,
  [
    body("product").isMongoId().withMessage("Valid product is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  ],
  validateRequest,
  createReview
);
router.put(
  "/:id",
  protect,
  [
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isString(),
  ],
  validateRequest,
  updateReview
);
router.delete("/:id", protect, deleteReview);

module.exports = router;
