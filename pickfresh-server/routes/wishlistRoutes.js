const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getWishlist, addProduct, removeProduct, clearWishlist } = require("../controllers/wishlistController");

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);

router.post(
  "/",
  [body("product").isMongoId().withMessage("Valid product is required")],
  validateRequest,
  addProduct
);

router.delete("/clear", clearWishlist);
router.delete("/:productId", removeProduct);

module.exports = router;
