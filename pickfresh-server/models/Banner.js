const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Banner image URL/path is required"],
    },
    link: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    position: {
      type: String,
      enum: ["hero", "carousel", "middle"],
      default: "carousel",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
