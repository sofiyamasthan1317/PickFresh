const path = require("path");
const fs = require("fs");
require("dotenv").config();
const checkEnv = require("./config/checkEnv");
checkEnv();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const mongoose = require("mongoose");

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const addressRoutes = require("./routes/addressRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const searchRoutes = require("./routes/searchRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const walletRoutes = require("./routes/walletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const chatRoutes = require("./routes/chatRoutes");

// ─── Middleware ───────────────────────────────────────────────────────────────
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const logger = require("./middleware/logger");

const app = express();
const uploadsDir = path.join(__dirname, "uploads");

app.set("etag", false);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// console.log("MONGO_URI:", process.env.MONGO_URI);
// ─── Database ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Error:", err);
    console.error("Error name:", err.name);
    console.error("Error code:", err.code);
    console.error("Error cause:", err.cause);
    process.exit(1);
  });

// ─── Security & Global Middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 200),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
}));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use("/api", (req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
app.use("/uploads", express.static(uploadsDir));

// ─── Swagger ──────────────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);  // kept for frontend backward-compatibility
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ success: true, message: "PickFresh API is running 🚀" }));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const http = require("http");
const server = http.createServer(app);

// Initialize Socket.io
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const socketHandler = require("./utils/socket");
socketHandler.init(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`Swagger docs → http://localhost:${PORT}/api-docs`);
});
