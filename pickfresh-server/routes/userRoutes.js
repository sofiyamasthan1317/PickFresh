const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/authController");

// PUT /api/users/profile (Protected)
router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim(),
    body("avatar").optional().trim(),
  ],
  validateRequest,
  updateProfile
);

// PATCH /api/users/profile (Protected)
router.patch(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim(),
    body("avatar").optional().trim(),
  ],
  validateRequest,
  updateProfile
);

module.exports = router;
