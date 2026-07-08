const asyncHandler = require("express-async-handler");
const Banner = require("../models/Banner");
const { sendSuccess } = require("../utils/responseHandler");

// GET /api/banners
const getBanners = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const banners = await Banner.find(filter).sort({ createdAt: -1 }).lean();
  sendSuccess(res, "Banners loaded successfully", banners);
});

// POST /api/banners (admin)
const createBanner = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.image = `/uploads/${req.file.filename}`;
  
  const banner = await Banner.create(data);
  sendSuccess(res, "Banner created successfully", banner, 201);
});

// PUT /api/banners/:id (admin)
const updateBanner = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.image = `/uploads/${req.file.filename}`;

  const banner = await Banner.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }

  sendSuccess(res, "Banner updated successfully", banner);
});

// DELETE /api/banners/:id (admin)
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }

  await banner.deleteOne();
  sendSuccess(res, "Banner removed successfully");
});

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
