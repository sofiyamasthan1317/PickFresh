const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { admin, vendorOnly, deliveryOnly } = require("../middleware/adminMiddleware");
const {
  getAdminDashboard,
  getVendorDashboard,
  getCustomerDashboard,
  getDeliveryDashboard,
} = require("../controllers/dashboardController");

router.get("/admin", protect, admin, getAdminDashboard);
router.get("/vendor", protect, vendorOnly, getVendorDashboard);
router.get("/customer", protect, getCustomerDashboard);
router.get("/delivery", protect, deliveryOnly, getDeliveryDashboard);

module.exports = router;
