// middleware/notFoundMiddleware.js

const notFound = (req, res, next) => {
  res.status(404);
  throw new Error(`Route not found - ${req.originalUrl}`);
};

module.exports = notFound;