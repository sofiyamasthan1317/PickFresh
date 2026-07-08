const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getWalletBalance,
  addMoney,
  payWallet,
  getTransactionHistory,
  getWalletSummary,
} = require("../controllers/walletController");

const router = express.Router();

router.use(protect);

router.get("/", getWalletSummary);
router.get("/balance", getWalletBalance);

router.post(
  "/add-money",
  [
    body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be at least ₹0.01"),
    body("description").optional().trim(),
  ],
  validateRequest,
  addMoney
);

router.post(
  "/pay",
  [
    body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be at least ₹0.01"),
    body("description").optional().trim(),
    body("orderId").optional().isString().withMessage("Valid order ID required"),
  ],
  validateRequest,
  payWallet
);

router.get(
  "/transactions",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
    query("type").optional().isIn(["all", "credit", "debit", "refund", "cashback", "payment"]),
  ],
  validateRequest,
  getTransactionHistory
);

module.exports = router;
