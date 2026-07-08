const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");

const calculateDiscount = (coupon, amount) => {
  let discount =
    coupon.discountType === "percentage"
      ? (amount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  return Math.min(discount, amount);
};

const findValidCoupon = async (code, amount) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
    const err = new Error("Coupon is invalid or expired");
    err.statusCode = 400;
    throw err;
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    const err = new Error("Coupon usage limit reached");
    err.statusCode = 400;
    throw err;
  }

  if (amount < coupon.minimumAmount) {
    const err = new Error(`Minimum order amount is ₹${coupon.minimumAmount}`);
    err.statusCode = 400;
    throw err;
  }

  return coupon;
};

// GET /api/coupons  (admin)
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

// GET /api/coupons/active  (public)
const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({ isActive: true, expiryDate: { $gt: new Date() } })
    .select("code discountType discountValue minimumAmount maxDiscount expiryDate")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

// POST /api/coupons  (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// PUT /api/coupons/:id  (admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  res.json({ success: true, data: coupon });
});

// DELETE /api/coupons/:id  (admin)
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  await coupon.deleteOne();
  res.json({ success: true, message: "Coupon removed" });
});

// POST /api/coupons/validate
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const coupon = await findValidCoupon(code, Number(amount));
  const discount = calculateDiscount(coupon, Number(amount));

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      payableAmount: Number(amount) - discount,
    },
  });
});

// POST /api/coupons/apply
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const coupon = await findValidCoupon(code, Number(amount));
  const discount = calculateDiscount(coupon, Number(amount));

  coupon.usedCount += 1;
  await coupon.save();

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discount,
      payableAmount: Number(amount) - discount,
    },
  });
});

module.exports = { getCoupons, getActiveCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon, applyCoupon };
