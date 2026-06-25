const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
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

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of products
 */
router.get(
  "/",
  [
    query("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be positive"),
    query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be positive"),
    query("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be positive"),
    query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be positive"),
  ],
  validateRequest,
  getProducts
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 */
router.post(
  "/",
  protect,
  admin,
  upload.array("images", 6),
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid product price is required"),
    body("category").isMongoId().withMessage("Valid category is required"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock cannot be negative"),
    body("offerPrice").optional().isFloat({ min: 0 }).withMessage("Offer price cannot be negative"),
  ],
  validateRequest,
  createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     summary: Get single product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Product details
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     summary: Update product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put(
  "/:id",
  protect,
  admin,
  upload.array("images", 6),
  [
    body("price").optional().isFloat({ min: 0 }).withMessage("Valid product price is required"),
    body("category").optional().isMongoId().withMessage("Valid category is required"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock cannot be negative"),
    body("offerPrice").optional().isFloat({ min: 0 }).withMessage("Offer price cannot be negative"),
  ],
  validateRequest,
  updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
