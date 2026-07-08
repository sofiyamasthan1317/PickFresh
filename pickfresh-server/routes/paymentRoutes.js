const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createPaymentIntent, stripeWebhook } = require("../controllers/paymentController");

const router = express.Router();

// Webhook is mounted with express.raw middleware at the server level,
// but we define the handler here. Note: webhook does NOT use protect.
router.post("/webhook", stripeWebhook);

// Protected endpoint to generate client secret for payment
router.post(
  "/create-intent",
  protect,
  [body("orderId").isMongoId().withMessage("Valid order ID is required")],
  validateRequest,
  createPaymentIntent
);

module.exports = router;
