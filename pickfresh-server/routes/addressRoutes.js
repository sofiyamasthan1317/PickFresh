const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");

const router = express.Router();

const addressValidation = (isUpdate = false) => {
  const optional = (rule) => (isUpdate ? rule.optional() : rule);

  return [
    optional(body("fullName")).trim().notEmpty().withMessage("Full name is required"),
    optional(body("phone")).trim().isLength({ min: 7, max: 15 }).withMessage("Valid phone is required"),
    optional(body("houseNumber")).trim().notEmpty().withMessage("House number is required"),
    optional(body("street")).trim().notEmpty().withMessage("Street is required"),
    optional(body("city")).trim().notEmpty().withMessage("City is required"),
    optional(body("state")).trim().notEmpty().withMessage("State is required"),
    optional(body("pincode")).trim().notEmpty().withMessage("Pincode is required"),
    body("isDefault").optional().isBoolean().withMessage("isDefault must be boolean"),
  ];
};

router.use(protect);
router.get("/", getAddresses);
router.get("/:id", getAddressById);
router.post("/", addressValidation(), validateRequest, createAddress);
router.put("/:id", addressValidation(true), validateRequest, updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
