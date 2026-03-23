const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = errorHandler;
