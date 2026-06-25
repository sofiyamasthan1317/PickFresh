const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.use(protect);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post(
  "/",
  [
    body("shippingAddress").isMongoId().withMessage("Valid shipping address is required"),
    body("paymentMethod").optional().isIn(["COD", "Card", "UPI", "Wallet"]).withMessage("Invalid payment method"),
    body("products").optional().isArray().withMessage("Products must be an array"),
    body("products.*.product").optional().isMongoId().withMessage("Valid product is required"),
    body("products.*.quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("deliveryCharge").optional().isFloat({ min: 0 }).withMessage("Delivery charge cannot be negative"),
    body("tax").optional().isFloat({ min: 0 }).withMessage("Tax cannot be negative"),
    body("discount").optional().isFloat({ min: 0 }).withMessage("Discount cannot be negative"),
  ],
  validateRequest,
  createOrder
);
router.put(
  "/:id",
  admin,
  [
    body("orderStatus").optional().isIn(["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"]),
    body("paymentStatus").optional().isIn(["Pending", "Paid", "Failed"]),
  ],
  validateRequest,
  updateOrder
);
router.delete("/:id", admin, deleteOrder);

module.exports = router;
