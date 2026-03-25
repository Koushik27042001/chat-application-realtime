/**
 * Simple structured logger for consistent log format.
 * Can be extended to integrate with Winston, Pino, or cloud logging services.
 */
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const output = JSON.stringify({ timestamp, level, message, ...meta });
  const fn = level === "error" ? console.error : console.log;
  fn(output);
};

module.exports = {
  info: (message, meta) => log("info", message, meta),
  error: (message, meta) => log("error", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  debug: (message, meta) => log("debug", message, meta),
};
