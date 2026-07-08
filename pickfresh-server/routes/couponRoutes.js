const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getCoupons,
  getActiveCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
} = require("../controllers/couponController");

const router = express.Router();

const couponValidation = (isUpdate = false) => {
  const opt = (rule) => (isUpdate ? rule.optional() : rule);
  return [
    opt(body("code")).trim().notEmpty().withMessage("Coupon code is required"),
    opt(body("discountType")).isIn(["percentage", "fixed"]).withMessage("Invalid discount type"),
    opt(body("discountValue")).isFloat({ min: 0 }).withMessage("Discount value cannot be negative"),
    body("minimumAmount").optional().isFloat({ min: 0 }),
    body("maxDiscount").optional().isFloat({ min: 0 }),
    body("usageLimit").optional().isInt({ min: 1 }),
    opt(body("expiryDate")).isISO8601().withMessage("Valid expiry date is required"),
    body("isActive").optional().isBoolean(),
  ];
};

const applyValidation = [
  body("code").trim().notEmpty().withMessage("Coupon code is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount is required"),
];

// Public
router.get("/active", getActiveCoupons);

// Protected
router.post("/validate", protect, applyValidation, validateRequest, validateCoupon);
router.post("/apply", protect, applyValidation, validateRequest, applyCoupon);

// Admin
router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, couponValidation(), validateRequest, createCoupon);
router.put("/:id", protect, admin, couponValidation(true), validateRequest, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
