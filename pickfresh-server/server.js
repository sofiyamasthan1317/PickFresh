// server.js

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const mongoose = require("mongoose");

// Routes
const productRoutes = require("./routes/productRoutes");

// Middleware
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const logger = require("./middleware/logger"); // optional

const authRoutes = require("./routes/authRoutes");

// App init
const app = express();

// 🔗 DB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/pickfresh")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Error ❌", err);
    process.exit(1);
  });

// 🔧 Middlewares
app.use(express.json());
app.use(logger); // optional (remove if not needed)

// 📄 Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🚀 Routes
app.use("/api/products", productRoutes);

app.use("/api/auth", authRoutes);

// 🧪 Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ❌ Not Found Middleware
app.use(notFound);

// ⚠️ Error Handler Middleware
app.use(errorHandler);

// 🚀 Server start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
