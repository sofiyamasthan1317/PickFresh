const express = require("express");
const { body, query } = require("express-validator");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { admin, deliveryOnly } = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  assignDelivery,
  getDeliveryDashboard,
  getMyDeliveries,
  updateDeliveryStatus,
  getCompletedDeliveries,
  getMyEarnings,
  updateDeliveryProfile,
  toggleAvailability,
} = require("../controllers/deliveryController");

// Admin: assign delivery partner to an order
router.post("/assign/:id", protect, admin,
  [body("deliveryPartnerId").isMongoId().withMessage("Valid delivery partner ID is required")],
  validateRequest, assignDelivery
);

// Delivery partner routes
router.get("/dashboard", protect, deliveryOnly, getDeliveryDashboard);

router.get("/my-deliveries", protect, deliveryOnly,
  [query("status").optional().isString()],
  validateRequest, getMyDeliveries
);

router.put("/status/:id", protect, deliveryOnly, [
  body("orderStatus").isIn(["Out For Delivery", "Delivered"]).withMessage("Status must be Out For Delivery or Delivered"),
  body("note").optional().trim(),
], validateRequest, updateDeliveryStatus);

router.get("/completed", protect, deliveryOnly, getCompletedDeliveries);

router.get("/earnings", protect, deliveryOnly, getMyEarnings);

router.patch("/profile", protect, deliveryOnly, [
  body("vehicleType").optional().trim(),
  body("vehicleNumber").optional().trim(),
  body("phone").optional().trim(),
], validateRequest, updateDeliveryProfile);

router.patch("/availability", protect, deliveryOnly, toggleAvailability);

module.exports = router;
