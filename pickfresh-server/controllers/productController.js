const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const { sendSuccess } = require("../utils/responseHandler");

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, q, category, brand, minPrice, maxPrice, rating, isAvailable, sort = "newest", page = 1, limit = 10 } = req.query;
    const filter = {};
    const searchTerm = search || q;

    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { brand: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } }
      ];
    }

    if (category) {
      const categoryFilter = [{ name: { $regex: category, $options: "i" } }];
      if (mongoose.Types.ObjectId.isValid(category)) categoryFilter.push({ _id: category });
      const matched = await Category.find({ $or: categoryFilter }).select("_id").lean();
      filter.category = { $in: matched.map((c) => c._id) };
    }

    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (rating) filter.ratings = { $gte: Number(rating) };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true";
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      priceLowToHigh: { price: 1 },
      priceHighToLow: { price: -1 },
      highestRated: { ratings: -1 }
    };
    const numericPage = Math.max(Number(page), 1);
    const numericLimit = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (numericPage - 1) * numericLimit;

    // Use lean() for read-only query performance
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name image description")
        .populate("createdBy", "name email")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    sendSuccess(res, "Products retrieved successfully", products, 200, {
      pagination: { total, page: numericPage, pages: Math.ceil(total / numericLimit), limit: numericLimit }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name image description")
      .populate("createdBy", "name email")
      .lean();

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    sendSuccess(res, "Product loaded successfully", product);
  } catch (error) {
    next(error);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      images: req.files?.length ? req.files.map((f) => `/uploads/${f.filename}`) : req.body.images,
      vendor: req.user.role === "vendor" ? req.user._id : (req.body.vendor || null),
      createdBy: req.user._id,
    });
    sendSuccess(res, "Product created successfully", product, 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id — vendor can only update own products
const updateProduct = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === "vendor") query.vendor = req.user._id;

    const product = await Product.findOne(query);
    if (!product) {
      res.status(404);
      throw new Error("Product not found or access denied");
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, {
      ...req.body,
      ...(req.files?.length && { images: req.files.map((f) => `/uploads/${f.filename}`) }),
    }, { new: true, runValidators: true }).populate("category", "name image description");

    sendSuccess(res, "Product updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id — vendor can only delete own products
const deleteProduct = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === "vendor") query.vendor = req.user._id;

    const product = await Product.findOne(query);
    if (!product) {
      res.status(404);
      throw new Error("Product not found or access denied");
    }

    await product.deleteOne();
    sendSuccess(res, "Product removed successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
