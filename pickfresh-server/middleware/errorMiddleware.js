// middleware/errorMiddleware.js

const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "..", "logs");
const errorLogPath = path.join(logsDir, "error.log");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (err.name === "CastError") {
    statusCode = 404;
    err.message = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 409;
    err.message = "Duplicate resource";
  }

  if (err.name === "ValidationError") {
    statusCode = 422;
  }

  // Write to error log file
  const logLine = `${new Date().toISOString()} [${statusCode}] ${req.method} ${req.originalUrl} - ${err.message}\n`;
  fs.appendFile(errorLogPath, logLine, () => {});

  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected error occurred",
    data: {},
    errors: {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
  });
};

module.exports = errorHandler;
