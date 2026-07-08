// Role middleware — all call next(error) so errorHandler picks them up

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403);
  return next(new Error("Admin access required"));
};

// alias
const adminOnly = admin;

const vendorOnly = (req, res, next) => {
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) return next();
  res.status(403);
  return next(new Error("Vendor access required"));
};

const deliveryOnly = (req, res, next) => {
  if (req.user && (req.user.role === "delivery" || req.user.role === "admin")) return next();
  res.status(403);
  return next(new Error("Delivery access required"));
};

const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === "customer") return next();
  res.status(403);
  return next(new Error("Customer access required"));
};

// authorize("admin", "vendor") — flexible multi-role check
const roles = (...allowed) => (req, res, next) => {
  if (req.user && allowed.includes(req.user.role)) return next();
  res.status(403);
  return next(new Error("Access denied"));
};

// alias used in some places
const authorize = roles;

module.exports = { admin, adminOnly, vendorOnly, deliveryOnly, customerOnly, roles, authorize };
