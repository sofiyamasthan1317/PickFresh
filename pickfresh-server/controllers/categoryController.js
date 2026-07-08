const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const { sendSuccess } = require("../utils/responseHandler");

const getCategories = asyncHandler(async (req, res) => {
  const { isActive, parent } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (parent === "null" || parent === "root") filter.parentCategory = null;
  else if (parent) filter.parentCategory = parent;

  const categories = await Category.find(filter)
    .populate("parentCategory", "name")
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, "Categories loaded successfully", categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate("parentCategory", "name")
    .lean();

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  sendSuccess(res, "Category loaded successfully", category);
});

const createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.image = `/uploads/${req.file.filename}`;
  if (!data.parentCategory) data.parentCategory = null;
  const category = await Category.create(data);
  sendSuccess(res, "Category created successfully", category, 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.image = `/uploads/${req.file.filename}`;
  const category = await Category.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).populate("parentCategory", "name");

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  sendSuccess(res, "Category updated successfully", category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await category.deleteOne();
  sendSuccess(res, "Category removed successfully");
});

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
