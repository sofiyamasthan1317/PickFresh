const express = require("express");
const { body, query } = require("express-validator");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

// ─── Self (protected) ─────────────────────────────────────────────────────────

router.get("/profile", protect, getProfile);

router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim(),
  ],
  validateRequest,
  updateProfile
);

router.patch(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim(),
  ],
  validateRequest,
  updateProfile
);

router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);

router.delete("/account", protect, deleteAccount);

// ─── Admin ────────────────────────────────────────────────────────────────────

router.get(
  "/",
  protect,
  admin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
  ],
  validateRequest,
  getAllUsers
);

router.get("/:id", protect, admin, getUserById);

router.put(
  "/:id/role",
  protect,
  admin,
  [body("role").isIn(["customer", "vendor", "delivery", "admin"]).withMessage("Invalid role")],
  validateRequest,
  updateUserRole
);

router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
