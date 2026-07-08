const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getAdminDashboard,
  getAllUsers, getUserById, updateUser, deleteUser, blockUser, unblockUser, changeUserRole,
  getVendors, approveVendor, rejectVendor, suspendVendor, activateVendor, getVendorProducts, getVendorOrders,
  getDeliveryPartners, suspendDeliveryPartner, activateDeliveryPartner, getDeliveryPartnerOrders, getDeliveryPerformance, assignDelivery,
  bulkUpdateProducts, bulkDeleteProducts,
  getAllReviews, hideReview, showReview, deleteReview,
  getSalesReport, getRevenueReport, getInventoryReport, getCustomerReport, getVendorReport,
  sendNotification,
} = require("../controllers/adminController");

const {
  getCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} = require("../controllers/categoryController");
const { sendBroadcast } = require("../controllers/notificationController");

const {
  getSettings, updateSettings,
} = require("../controllers/platformSettingsController");

const router = express.Router();
router.use(protect, admin);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// User Management
router.get("/users", [query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1 })], validateRequest, getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", [
  body("role").optional().isIn(["customer", "vendor", "admin", "delivery"]).withMessage("Invalid role"),
  body("isBlocked").optional().isBoolean(),
], validateRequest, updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.patch("/users/:id/role", [body("role").isIn(["customer", "vendor", "admin", "delivery"]).withMessage("Invalid role")], validateRequest, changeUserRole);

// Vendor Management
router.get("/vendors", getVendors);
router.patch("/vendors/:id/approve", approveVendor);
router.patch("/vendors/:id/reject", rejectVendor);
router.patch("/vendors/:id/suspend", suspendVendor);
router.patch("/vendors/:id/activate", activateVendor);
router.get("/vendors/:id/products", getVendorProducts);
router.get("/vendors/:id/orders", getVendorOrders);

// Delivery Management
router.get("/delivery-partners", getDeliveryPartners);
router.patch("/delivery-partners/:id/suspend", suspendDeliveryPartner);
router.patch("/delivery-partners/:id/activate", activateDeliveryPartner);
router.get("/delivery-partners/:id/orders", getDeliveryPartnerOrders);
router.get("/delivery-partners/:id/performance", getDeliveryPerformance);
router.post("/orders/:id/assign", [body("deliveryPartnerId").isMongoId().withMessage("Valid delivery partner ID required")], validateRequest, assignDelivery);

// Product Bulk Actions
router.patch("/products/bulk", [body("ids").isArray({ min: 1 }).withMessage("Product IDs required"), body("update").isObject().withMessage("Update object required")], validateRequest, bulkUpdateProducts);
router.delete("/products/bulk", [body("ids").isArray({ min: 1 }).withMessage("Product IDs required")], validateRequest, bulkDeleteProducts);

// Category Management (admin-scoped)
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", upload.single("image"), [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  body("isActive").optional().isBoolean(),
  body("parentCategory").optional().isMongoId(),
], validateRequest, createCategory);
router.put("/categories/:id", upload.single("image"), [
  body("name").optional().trim().notEmpty().withMessage("Category name cannot be empty"),
  body("isActive").optional().isBoolean(),
  body("parentCategory").optional().isMongoId(),
], validateRequest, updateCategory);
router.delete("/categories/:id", deleteCategory);

// Review Moderation
router.get("/reviews", getAllReviews);
router.patch("/reviews/:id/hide", hideReview);
router.patch("/reviews/:id/show", showReview);
router.delete("/reviews/:id", deleteReview);

// Reports
router.get("/reports/sales", getSalesReport);
router.get("/reports/revenue", getRevenueReport);
router.get("/reports/inventory", getInventoryReport);
router.get("/reports/customers", getCustomerReport);
router.get("/reports/vendors", getVendorReport);

// Notifications
router.post("/notify", [
  body("title").trim().notEmpty().withMessage("Title required"),
  body("message").trim().notEmpty().withMessage("Message required"),
  body("type").optional().isIn(["order", "delivery", "admin", "offer"]),
], validateRequest, sendNotification);
router.post("/notifications/send", [
  body("title").trim().notEmpty().withMessage("Title required"),
  body("message").trim().notEmpty().withMessage("Message required"),
  body("type").optional().isIn(["order", "payment", "promotion", "system", "review", "chat", "delivery", "coupon"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("recipientType").optional().isIn(["single-user", "multiple-users", "all-customers", "all-vendors", "all-delivery-partners", "all-users"]),
  body("userIds").optional().isArray(),
], validateRequest, sendBroadcast);

// Platform Settings
router.get("/settings", getSettings);
router.put("/settings", [
  body("platformName").optional().trim().notEmpty().withMessage("Platform name cannot be empty"),
  body("supportEmail").optional().isEmail().withMessage("Valid email required"),
  body("supportPhone").optional().trim(),
  body("deliveryCharge").optional().isFloat({ min: 0 }).withMessage("Delivery charge must be >= 0"),
  body("minimumOrderAmount").optional().isFloat({ min: 0 }).withMessage("Minimum order must be >= 0"),
  body("platformCommission").optional().isFloat({ min: 0, max: 100 }).withMessage("Commission must be 0-100"),
  body("taxPercentage").optional().isFloat({ min: 0, max: 100 }).withMessage("Tax must be 0-100"),
  body("currency").optional().trim(),
  body("maintenanceMode").optional().isBoolean(),
  body("maintenanceMessage").optional().trim(),
  body("allowVendorRegistration").optional().isBoolean(),
  body("allowCustomerRegistration").optional().isBoolean(),
], validateRequest, updateSettings);

module.exports = router;
