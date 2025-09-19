const logger = require("../utils/logger");
const { errorResponse } = require("../utils/response");
const { ApiError } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error in ${req.method} ${req.originalUrl}:`, {
    message: error.message,
    stack: error.stack,
    user: req.user ? req.user.id : "anonymous",
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Invalid resource ID format";
    error = new ApiError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = new ApiError(message, 409);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ApiError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new ApiError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new ApiError(message, 401);
  }

  // Handle specific operational errors
  if (error.isOperational === false || !error.statusCode) {
    error.statusCode = 500;
    error.message = "Something went wrong";
  }

  res.status(error.statusCode).json(
    errorResponse(
      error.message,
      error.statusCode,
      process.env.NODE_ENV === "development"
        ? {
            stack: error.stack,
            details: error,
          }
        : null
    )
  );
};

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
