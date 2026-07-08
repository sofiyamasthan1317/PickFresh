const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: [6, "Password must be at least 6 characters"] },
    phone: { type: String, default: null },
    avatar: { type: String, default: null },
    role: { type: String, enum: ["admin", "customer", "vendor", "delivery"], default: "customer" },
    isEmailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    // Vendor-specific
    businessName: { type: String, trim: true, default: null },
    storeName: { type: String, trim: true, default: null },
    businessAddress: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    pincode: { type: String, trim: true, default: null },
    gstNumber: { type: String, trim: true, default: null },
    fssaiNumber: { type: String, trim: true, default: null },
    businessDescription: { type: String, trim: true, default: null },
    shopLogo: { type: String, default: null },
    coverImage: { type: String, default: null },
    vendorStatus: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: null },
    // Delivery-specific
    vehicleType: { type: String, trim: true, default: null },
    vehicleNumber: { type: String, trim: true, default: null },
    isAvailable: { type: Boolean, default: false },
    // Auth
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    otpPurpose: { type: String, enum: ["email-verify", "forgot-password", null], default: null },
    refreshToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateOtp = function (purpose = "email-verify") {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = bcrypt.genSaltSync(12);
  this.otp = bcrypt.hashSync(otp, salt);
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  this.otpPurpose = purpose;
  return otp; // Return plaintext OTP so it can be sent via email
};

userSchema.methods.verifyOtp = async function (inputOtp, purpose) {
  if (!this.otp || !this.otpExpiry) return false;
  if (this.otpPurpose !== purpose) return false;
  if (Date.now() > this.otpExpiry.getTime()) return false;
  return await bcrypt.compare(inputOtp, this.otp);
};

userSchema.methods.clearOtp = function () {
  this.otp = null;
  this.otpExpiry = null;
  this.otpPurpose = null;
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.otpPurpose;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpiry;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
