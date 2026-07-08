const express = require("express");
const { query } = require("express-validator");
const router = express.Router();
const validateRequest = require("../middleware/validateRequest");
const { globalSearch } = require("../controllers/searchController");

router.get(
  "/",
  [
    query("q").notEmpty().withMessage("Search query is required"),
    query("limit").optional().isInt({ min: 1, max: 20 }),
  ],
  validateRequest,
  globalSearch
);

module.exports = router;
