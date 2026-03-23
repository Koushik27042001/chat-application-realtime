const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message, { stack: err.stack });
  if (statusCode >= 500) {
    console.error("[500] Full error:", err);
  }

  const message = statusCode >= 500 ? "Internal Server Error" : err.message;

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = errorHandler;
