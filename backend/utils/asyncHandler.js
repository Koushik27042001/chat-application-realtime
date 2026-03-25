/**
 * Wraps async route handlers to automatically catch errors and pass to express error middleware.
 * Removes the need for try-catch in every controller.
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
