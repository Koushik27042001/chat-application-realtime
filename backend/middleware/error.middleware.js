const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  /** Only treat real server faults as errors — 4xx are expected client/session issues */
  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack });
    console.error("[500] Full error:", err);
  } else if (statusCode >= 400) {
    logger.warn(err.message, {
      path: req?.path,
      statusCode,
    });
  }

  const message = statusCode >= 500 ? "Internal Server Error" : err.message;

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = errorHandler;
