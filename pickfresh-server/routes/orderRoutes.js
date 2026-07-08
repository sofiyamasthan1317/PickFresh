const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  getInvoice,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
  ],
  validateRequest,
  getOrders
);

router.get("/:id", getOrderById);
router.get("/:id/invoice", getInvoice);

router.post(
  "/",
  [
    body("shippingAddress").isMongoId().withMessage("Valid shipping address is required"),
    body("paymentMethod").optional().isIn(["COD", "Card", "UPI", "Wallet"]).withMessage("Invalid payment method"),
    body("products").optional().isArray().withMessage("Products must be an array"),
    body("products.*.product").optional().isMongoId().withMessage("Valid product ID required"),
    body("products.*.quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("deliveryCharge").optional().isFloat({ min: 0 }),
    body("tax").optional().isFloat({ min: 0 }),
    body("discount").optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  createOrder
);

router.put(
  "/:id",
  admin,
  [
    body("orderStatus")
      .optional()
      .isIn(["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled", "Returned"])
      .withMessage("Invalid order status"),
    body("paymentStatus").optional().isIn(["Pending", "Paid", "Failed"]).withMessage("Invalid payment status"),
  ],
  validateRequest,
  updateOrder
);

router.post(
  "/:id/cancel",
  [body("reason").optional().trim()],
  validateRequest,
  cancelOrder
);

router.delete("/:id", admin, deleteOrder);

module.exports = router;
