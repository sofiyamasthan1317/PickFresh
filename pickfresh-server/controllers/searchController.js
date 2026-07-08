const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/UserModel");
const { sendSuccess } = require("../utils/responseHandler");

const globalSearch = asyncHandler(async (req, res) => {
  const { q, limit = 5 } = req.query;

  if (!q || q.trim().length < 1) {
    return sendSuccess(res, "Search results", { products: [], categories: [], vendors: [] });
  }

  const regex = { $regex: q.trim(), $options: "i" };
  const numericLimit = Math.min(Number(limit), 20);

  const [products, categories, vendors] = await Promise.all([
    Product.find({ $or: [{ name: regex }, { brand: regex }], isAvailable: true })
      .select("name images price offerPrice ratings brand category")
      .populate("category", "name")
      .limit(numericLimit)
      .lean(),

    Category.find({ name: regex, isActive: true })
      .select("name image description")
      .limit(numericLimit)
      .lean(),

    User.find({ name: regex, role: "vendor" })
      .select("name avatar")
      .limit(numericLimit)
      .lean(),
  ]);

  sendSuccess(res, "Search completed successfully", { products, categories, vendors });
});

module.exports = { globalSearch };
