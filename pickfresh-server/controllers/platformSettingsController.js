const asyncHandler = require("express-async-handler");
const PlatformSettings = require("../models/PlatformSettings");
const { sendSuccess } = require("../utils/responseHandler");

const getOrCreateSettings = async () => {
  let settings = await PlatformSettings.findOne();
  if (!settings) settings = await PlatformSettings.create({});
  return settings;
};

// GET /api/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  sendSuccess(res, "Settings loaded successfully", settings);
});

// PUT /api/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const {
    platformName, supportEmail, supportPhone, deliveryCharge,
    minimumOrderAmount, platformCommission, taxPercentage, currency,
    maintenanceMode, maintenanceMessage, allowVendorRegistration, allowCustomerRegistration,
  } = req.body;

  const settings = await getOrCreateSettings();
  Object.assign(settings, {
    ...(platformName !== undefined && { platformName }),
    ...(supportEmail !== undefined && { supportEmail }),
    ...(supportPhone !== undefined && { supportPhone }),
    ...(deliveryCharge !== undefined && { deliveryCharge }),
    ...(minimumOrderAmount !== undefined && { minimumOrderAmount }),
    ...(platformCommission !== undefined && { platformCommission }),
    ...(taxPercentage !== undefined && { taxPercentage }),
    ...(currency !== undefined && { currency }),
    ...(maintenanceMode !== undefined && { maintenanceMode }),
    ...(maintenanceMessage !== undefined && { maintenanceMessage }),
    ...(allowVendorRegistration !== undefined && { allowVendorRegistration }),
    ...(allowCustomerRegistration !== undefined && { allowCustomerRegistration }),
  });
  await settings.save();
  sendSuccess(res, "Settings updated successfully", settings);
});

module.exports = { getSettings, updateSettings };
