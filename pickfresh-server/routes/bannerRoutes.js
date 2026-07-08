const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

const router = express.Router();

router.get("/", getBanners);

// Admin-protected CRUD routes
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  [
    body("title").trim().notEmpty().withMessage("Banner title is required"),
    body("isActive").optional().isBoolean(),
    body("position").optional().isIn(["hero", "carousel", "middle"]),
  ],
  validateRequest,
  createBanner
);

router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  [
    body("title").optional().trim().notEmpty().withMessage("Banner title cannot be empty"),
    body("isActive").optional().isBoolean(),
    body("position").optional().isIn(["hero", "carousel", "middle"]),
  ],
  validateRequest,
  updateBanner
);

router.delete("/:id", protect, admin, deleteBanner);

module.exports = router;
