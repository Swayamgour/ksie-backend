// Wraps async route handlers so rejected promises are forwarded to Express error middleware
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
