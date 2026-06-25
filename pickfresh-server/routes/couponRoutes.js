const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
} = require("../controllers/couponController");

const router = express.Router();

const couponValidation = (isUpdate = false) => {
  const optional = (rule) => (isUpdate ? rule.optional() : rule);

  return [
    optional(body("code")).trim().notEmpty().withMessage("Coupon code is required"),
    optional(body("discountType")).isIn(["percentage", "fixed"]).withMessage("Invalid discount type"),
    optional(body("discountValue")).isFloat({ min: 0 }).withMessage("Discount value cannot be negative"),
    body("minimumAmount").optional().isFloat({ min: 0 }).withMessage("Minimum amount cannot be negative"),
    optional(body("expiryDate")).isISO8601().withMessage("Valid expiry date is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  ];
};

const applyValidation = [
  body("code").trim().notEmpty().withMessage("Coupon code is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount cannot be negative"),
];

router.post("/validate", protect, applyValidation, validateRequest, validateCoupon);
router.post("/apply", protect, applyValidation, validateRequest, applyCoupon);
router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, couponValidation(), validateRequest, createCoupon);
router.put("/:id", protect, admin, couponValidation(true), validateRequest, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
