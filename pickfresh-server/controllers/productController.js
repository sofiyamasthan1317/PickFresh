const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// @desc   Get all products
// @route  GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      isAvailable,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      const categoryFilter = [{ name: { $regex: category, $options: "i" } }];

      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryFilter.push({ _id: category });
      }

      const matchedCategories = await Category.find({ $or: categoryFilter }).select("_id");

      filter.category = { $in: matchedCategories.map((item) => item._id) };
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
      highestRated: { ratings: -1 },
    };

    const numericPage = Math.max(Number(page), 1);
    const numericLimit = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (numericPage - 1) * numericLimit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name image description")
        .populate("createdBy", "name email")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(numericLimit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
        limit: numericLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single product
// @route  GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name image description")
      .populate("createdBy", "name email");

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc   Create product
// @route  POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      images: req.files?.length ? req.files.map((file) => `/uploads/${file.filename}`) : req.body.images,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc   Update product
// @route  PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.files?.length && { images: req.files.map((file) => `/uploads/${file.filename}`) }),
      },
      { new: true, runValidators: true }
    ).populate("category", "name image description");

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete product
// @route  DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await product.deleteOne();

    res.json({ success: true, message: "Product removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
