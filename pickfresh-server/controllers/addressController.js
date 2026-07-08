const asyncHandler = require("express-async-handler");
const Address = require("../models/Address");
const { sendSuccess } = require("../utils/responseHandler");

const normalizeDefaultAddress = async (userId, addressId, isDefault) => {
  if (isDefault) {
    await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { isDefault: false });
  }
};

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  sendSuccess(res, "Addresses retrieved successfully", addresses);
});

const getAddressById = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  sendSuccess(res, "Address retrieved successfully", address);
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await Address.create({ ...req.body, user: req.user._id });
  await normalizeDefaultAddress(req.user._id, address._id, address.isDefault);
  sendSuccess(res, "Address created successfully", address, 201);
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  await normalizeDefaultAddress(req.user._id, address._id, address.isDefault);
  sendSuccess(res, "Address updated successfully", address);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  await address.deleteOne();
  sendSuccess(res, "Address removed successfully");
});

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
