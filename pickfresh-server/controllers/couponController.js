const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");

const calculateDiscount = (coupon, amount) => {
  if (coupon.discountType === "percentage") {
    return Math.min((amount * coupon.discountValue) / 100, amount);
  }

  return Math.min(coupon.discountValue, amount);
};

const findValidCoupon = async (code, amount) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
    const error = new Error("Coupon is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  if (amount < coupon.minimumAmount) {
    const error = new Error(`Minimum order amount is ${coupon.minimumAmount}`);
    error.statusCode = 400;
    throw error;
  }

  return coupon;
};

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

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

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  await coupon.deleteOne();
  res.json({ success: true, message: "Coupon removed" });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const coupon = await findValidCoupon(code, Number(amount));
  res.json({ success: true, data: coupon });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const coupon = await findValidCoupon(code, Number(amount));
  const discount = calculateDiscount(coupon, Number(amount));

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discount,
      payableAmount: Number(amount) - discount,
    },
  });
});

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
};
