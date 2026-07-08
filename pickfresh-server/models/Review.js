const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reply: {
      text: { type: String, trim: true, default: null },
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      repliedAt: { type: Date, default: null },
    },
    isHidden: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1 });
reviewSchema.index({ isHidden: 1 });

module.exports = mongoose.model("Review", reviewSchema);
