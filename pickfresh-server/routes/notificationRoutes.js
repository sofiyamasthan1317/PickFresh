const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
  sendBroadcast,
} = require("../controllers/notificationController");

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);
router.delete("/clear", clearNotifications);

// Admin: broadcast
router.post(
  "/broadcast",
  admin,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("type").optional().isIn(["order", "payment", "promotion", "system", "review", "chat", "delivery", "coupon"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("recipientType").optional().isIn(["single-user", "multiple-users", "all-customers", "all-vendors", "all-delivery-partners", "all-users"]),
    body("role").optional().isIn(["customer", "vendor", "delivery", "admin"]),
    body("userIds").optional().isArray(),
  ],
  validateRequest,
  sendBroadcast
);

module.exports = router;
