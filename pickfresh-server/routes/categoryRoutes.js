const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Grocery category management
 */
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post(
  "/",
  protect,
  admin,
  [
    body("name").trim().notEmpty().withMessage("Category name is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  ],
  validateRequest,
  createCategory
);
router.put(
  "/:id",
  protect,
  admin,
  [
    body("name").optional().trim().notEmpty().withMessage("Category name cannot be empty"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  ],
  validateRequest,
  updateCategory
);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
