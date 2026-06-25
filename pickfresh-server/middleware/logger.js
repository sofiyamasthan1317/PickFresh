const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "..", "logs");
const accessLogPath = path.join(logsDir, "access.log");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const message = `${new Date().toISOString()} ${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`;

    if (process.env.NODE_ENV !== "production") {
      console.log(message);
    }

    fs.appendFile(accessLogPath, `${message}\n`, (error) => {
      if (error && process.env.NODE_ENV !== "production") {
        console.error("Failed to write access log", error.message);
      }
    });
  });

  next();
};

module.exports = logger;
