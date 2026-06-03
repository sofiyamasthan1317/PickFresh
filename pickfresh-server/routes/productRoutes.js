const express = require("express");
const { protect } = require("../middleware/authMiddleware");
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
router.get("/", protect, getProducts); // public

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
router.post("/", protect, createProduct); // protected

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
router.put("/:id", protect, updateProduct); // protected

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
router.delete("/:id", protect, deleteProduct); // protected

module.exports = router;
