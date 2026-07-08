const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: "PickFresh", trim: true },
    supportEmail: { type: String, default: "support@pickfresh.local", trim: true, lowercase: true },
    supportPhone: { type: String, default: "", trim: true },
    deliveryCharge: { type: Number, default: 40, min: 0 },
    minimumOrderAmount: { type: Number, default: 100, min: 0 },
    platformCommission: { type: Number, default: 10, min: 0, max: 100 },
    taxPercentage: { type: Number, default: 5, min: 0, max: 100 },
    currency: { type: String, default: "INR", trim: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "We are under maintenance. Please check back soon.", trim: true },
    allowVendorRegistration: { type: Boolean, default: true },
    allowCustomerRegistration: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
