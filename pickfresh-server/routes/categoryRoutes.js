const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  [
    body("name").trim().notEmpty().withMessage("Category name is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
    body("parentCategory").optional().isMongoId().withMessage("Valid parent category ID required"),
  ],
  validateRequest,
  createCategory
);

router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  [
    body("name").optional().trim().notEmpty().withMessage("Category name cannot be empty"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
    body("parentCategory").optional().isMongoId().withMessage("Valid parent category ID required"),
  ],
  validateRequest,
  updateCategory
);

router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
