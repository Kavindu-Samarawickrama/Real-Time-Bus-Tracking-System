class ApiError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApiError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
    this.type = "ValidationError";
  }
}

class AuthenticationError extends ApiError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.type = "AuthenticationError";
  }
}

class AuthorizationError extends ApiError {
  constructor(message = "Access denied") {
    super(message, 403);
    this.type = "AuthorizationError";
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.type = "NotFoundError";
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
