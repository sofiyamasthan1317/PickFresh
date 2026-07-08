const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { vendorOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getVendorDashboard,
  getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct, updateStock, bulkUpdateStock,
  getMyOrders, updateOrderStatus,
  getMyReviews, replyToReview,
  getMyAnalytics,
  getMyEarnings,
  getVendorProfile, updateVendorProfile, updateVendorLogo, updateVendorCover,
} = require("../controllers/vendorController");

const router = express.Router();
router.use(protect, vendorOnly);

// Dashboard
router.get("/dashboard", getVendorDashboard);

// Products
router.get("/products", [query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1 })], validateRequest, getMyProducts);

router.post("/products", upload.array("images", 6), [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  body("category").isMongoId().withMessage("Valid category ID is required"),
  body("stock").optional().isInt({ min: 0 }),
  body("offerPrice").optional().isFloat({ min: 0 }),
  body("unit").optional().trim(),
], validateRequest, createMyProduct);

router.put("/products/:id", upload.array("images", 6), [
  body("price").optional().isFloat({ min: 0 }),
  body("category").optional().isMongoId(),
  body("stock").optional().isInt({ min: 0 }),
  body("offerPrice").optional().isFloat({ min: 0 }),
], validateRequest, updateMyProduct);

router.delete("/products/:id", deleteMyProduct);

router.patch("/products/bulk-stock", [
  body("updates").isArray({ min: 1 }).withMessage("Updates array required"),
  body("updates.*.id").isMongoId().withMessage("Valid product ID required"),
  body("updates.*.stock").isInt({ min: 0 }).withMessage("Stock must be non-negative"),
], validateRequest, bulkUpdateStock);

router.patch("/products/:id/stock", [
  body("stock").isInt({ min: 0 }).withMessage("Stock must be non-negative"),
], validateRequest, updateStock);

// Orders
router.get("/orders", [query("page").optional().isInt({ min: 1 }), query("status").optional().isString()], validateRequest, getMyOrders);

router.patch("/orders/:id/status", [
  body("orderStatus").isIn(["Confirmed", "Packed", "Shipped"]).withMessage("Invalid status for vendor"),
  body("note").optional().trim(),
], validateRequest, updateOrderStatus);

// Reviews
router.get("/reviews", getMyReviews);

router.post("/reviews/:id/reply", [
  body("text").trim().notEmpty().withMessage("Reply text is required"),
], validateRequest, replyToReview);

// Analytics
router.get("/analytics", getMyAnalytics);

// Earnings
router.get("/earnings", getMyEarnings);

// Profile
router.get("/profile", getVendorProfile);

router.put("/profile", [
  body("storeName").optional().trim().notEmpty().withMessage("Store name cannot be empty"),
  body("businessName").optional().trim(),
  body("phone").optional().trim(),
  body("city").optional().trim(),
  body("state").optional().trim(),
  body("pincode").optional().trim(),
  body("gstNumber").optional().trim(),
  body("fssaiNumber").optional().trim(),
  body("businessDescription").optional().trim(),
], validateRequest, updateVendorProfile);

router.patch("/profile/logo", upload.single("logo"), updateVendorLogo);
router.patch("/profile/cover", upload.single("cover"), updateVendorCover);

module.exports = router;
