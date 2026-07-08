const jwt = require("jsonwebtoken");
const { jwtSecret } = require("./generateToken");
const User = require("../models/UserModel");

let globalIo = null;

const init = (io) => {
  globalIo = io;

  // Middleware to authenticate socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication token required"));
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      socket.userId = decoded.id;

      // Fetch user role so they can join a role room
      const user = await User.findById(decoded.id).select("role").lean();
      if (user) {
        socket.role = user.role;
      }

      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    const role = socket.role;

    // Join individual room
    socket.join(userId.toString());

    // Join role-specific room (e.g. 'admin', 'vendor', 'delivery', 'customer')
    if (role) {
      socket.join(role);
      console.log(`🟢 User ${userId} (${role}) connected to Socket.io`);
    } else {
      console.log(`🟢 User ${userId} connected to Socket.io`);
    }

    socket.on("disconnect", () => {
      console.log(`🔴 User ${userId} disconnected from Socket.io`);
    });

    // Delivery partner -> server location updates
    socket.on("delivery-location", async (payload) => {
      try {
        const { orderId, lat, lng } = payload || {};
        if (!orderId || lat === undefined || lng === undefined) return;

        // Lazily require Order model to avoid circular deps at top-level
        const Order = require("../models/Order");
        const order = await Order.findOne({ $or: [{ orderId }, { _id: orderId }] }).lean();

        const data = { orderId: orderId, lat, lng, updatedAt: new Date() };

        // Notify the customer who placed the order (if known)
        if (order && order.user) {
          sendToUser(order.user, "delivery-location", data);
        }

        // Also notify the assigned delivery partner (echo back), admin room and vendor/admin dashboards
        if (order && order.assignedTo) {
          sendToUser(order.assignedTo, "delivery-location", data);
        }

        // Broadcast to admins for monitoring dashboards
        broadcastToRole("admin", "delivery-location", data);
      } catch (err) {
        console.error("Error handling delivery-location socket event", err);
      }
    });
  });
};

const sendToUser = (userId, event, data) => {
  if (globalIo && userId) {
    globalIo.to(userId.toString()).emit(event, data);
  }
};

const broadcastToRole = (role, event, data) => {
  if (globalIo && role) {
    globalIo.to(role).emit(event, data);
  }
};

const broadcastAll = (event, data) => {
  if (globalIo) {
    globalIo.emit(event, data);
  }
};

module.exports = {
  init,
  sendToUser,
  broadcastToRole,
  broadcastAll,
};
