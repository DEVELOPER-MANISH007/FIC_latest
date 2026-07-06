import ApiError from "../utils/ApiError.js";

/**
 * Global error-handling middleware. Must be registered last.
 * Normalizes Mongoose validation/cast errors and unexpected
 * errors into a consistent JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error.errors || []);
  }

  if (err.name === "ValidationError") {
    error.errors = Object.values(err.errors).map((e) => e.message);
    error.statusCode = 400;
  }

  if (err.code === 11000) {
    error.statusCode = 409;
    error.message = "Duplicate field value entered";
  }

  if (err.name === "MulterError") {
    error.statusCode = 400;
    error.message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 10 MB)" : err.message;
  }

  if (err.message?.includes("Multipart: Boundary not found")) {
    error.statusCode = 400;
    error.message = "Invalid file upload request. Please retry the import.";
  }

  if (err.name === "CastError") {
    error.statusCode = 400;
    error.message = `Invalid value for field: ${err.path}`;
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  };

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${error.statusCode}: ${error.message}`);

  res.status(error.statusCode || 500).json(response);
};

export default errorHandler;
