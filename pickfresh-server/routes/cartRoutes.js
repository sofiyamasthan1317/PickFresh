const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getCart, addItem, updateQuantity, removeItem, clearCart } = require("../controllers/cartController");

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post(
  "/items",
  [
    body("product").isMongoId().withMessage("Valid product is required"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  ],
  validateRequest,
  addItem
);
router.put(
  "/items/:productId",
  [body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1")],
  validateRequest,
  updateQuantity
);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
