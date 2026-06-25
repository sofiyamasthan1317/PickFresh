const asyncHandler = require("express-async-handler");
const Address = require("../models/Address");

const normalizeDefaultAddress = async (userId, addressId, isDefault) => {
  if (isDefault) {
    await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { isDefault: false });
  }
};

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, data: addresses });
});

const getAddressById = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  res.json({ success: true, data: address });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await Address.create({ ...req.body, user: req.user._id });
  await normalizeDefaultAddress(req.user._id, address._id, address.isDefault);
  res.status(201).json({ success: true, data: address });
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
  res.json({ success: true, data: address });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  await address.deleteOne();
  res.json({ success: true, message: "Address removed" });
});

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
