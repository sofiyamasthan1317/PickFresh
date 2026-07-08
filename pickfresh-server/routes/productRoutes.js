const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin, roles } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Public — GET all products
router.get("/", [
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("rating").optional().isFloat({ min: 0, max: 5 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1 }),
], validateRequest, getProducts);

// Public — GET single product
router.get("/:id", getProductById);

// Admin or Vendor — create product
router.post("/", protect, roles("admin", "vendor"), upload.array("images", 6), [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Valid product price is required"),
  body("category").isMongoId().withMessage("Valid category is required"),
  body("stock").optional().isInt({ min: 0 }),
  body("offerPrice").optional().isFloat({ min: 0 }),
], validateRequest, createProduct);

// Admin or Vendor (own product) — update product
router.put("/:id", protect, roles("admin", "vendor"), upload.array("images", 6), [
  body("price").optional().isFloat({ min: 0 }),
  body("category").optional().isMongoId(),
  body("stock").optional().isInt({ min: 0 }),
  body("offerPrice").optional().isFloat({ min: 0 }),
], validateRequest, updateProduct);

// Admin or Vendor (own product) — delete product
router.delete("/:id", protect, roles("admin", "vendor"), deleteProduct);

module.exports = router;
