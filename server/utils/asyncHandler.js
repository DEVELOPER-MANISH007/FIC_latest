/**
 * Wraps an async Express route handler so any rejected promise
 * or thrown error is automatically forwarded to next(err),
 * avoiding repetitive try/catch blocks in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

