/**
 * Requires auth middleware to run first (req.user populated).
 */
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Admin access only" });
  }
  next();
};
