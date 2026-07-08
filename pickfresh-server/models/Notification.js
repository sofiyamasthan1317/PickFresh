const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["order", "payment", "promotion", "system", "review", "chat", "delivery", "coupon"],
      default: "system",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    receiver: {
      type: String,
      default: "user",
    },
    referenceId: {
      type: String,
      default: null,
    },
    referenceType: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

notificationSchema.post("save", function (doc) {
  try {
    const socket = require("../utils/socket");
    socket.sendToUser(doc.user, "notification", doc);
  } catch (error) {
    console.error("Failed to push real-time socket notification:", error.message);
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
