// src/middlewares/auth.js
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const { ApiError } = require("../utils/errors");

/**
 * Authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header or cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError("Access token is required", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      throw new ApiError("User not found or token is invalid", 401);
    }

    // Check if user account is active
    if (user.status !== "active") {
      throw new ApiError(
        `Account is ${user.status}. Please contact administrator.`,
        403
      );
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new ApiError("Account is temporarily locked", 423);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Token has expired", 401));
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.id);

      if (user && user.status === "active" && !user.isLocked) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

/**
 * Check user role authorization
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError("Insufficient permissions", 403));
    }

    next();
  };
};

/**
 * Check specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }

    if (!req.user.permissions[permission]) {
      return next(new ApiError(`Permission '${permission}' is required`, 403));
    }

    next();
  };
};

/**
 * Check multiple permissions (OR logic)
 */
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }

    const hasPermission = permissions.some(
      (permission) => req.user.permissions[permission]
    );

    if (!hasPermission) {
      return next(
        new ApiError(
          `One of these permissions is required: ${permissions.join(", ")}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check multiple permissions (AND logic)
 */
const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }

    const hasAllPermissions = permissions.every(
      (permission) => req.user.permissions[permission]
    );

    if (!hasAllPermissions) {
      return next(
        new ApiError(
          `All of these permissions are required: ${permissions.join(", ")}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check if user owns the resource or has admin privileges
 */
const ownerOrAdmin = (userIdField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Authentication required", 401));
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    // Allow if user is admin or owns the resource
    if (req.user.role === "ntc_admin" || req.user.id === resourceUserId) {
      return next();
    }

    return next(
      new ApiError("Access denied: You can only access your own resources", 403)
    );
  };
};

/**
 * Rate limiting by user role
 */
const roleBasedRateLimit = () => {
  const limits = {
    ntc_admin: 200, // 200 requests per window
    bus_operator: 100, // 100 requests per window
    commuter: 50, // 50 requests per window
  };

  return (req, res, next) => {
    if (req.user) {
      req.rateLimit = limits[req.user.role] || limits.commuter;
    }
    next();
  };
};

/**
 * Middleware to check if user can manage other users
 */
const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("Authentication required", 401));
  }

  // Only NTC admins can manage users
  if (req.user.role !== "ntc_admin") {
    return next(new ApiError("Only NTC administrators can manage users", 403));
  }

  // Additional check for specific permission
  if (!req.user.permissions.canManageUsers) {
    return next(new ApiError("User management permission is required", 403));
  }

  next();
};

/**
 * Middleware to check if user can manage buses
 */
const canManageBuses = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("Authentication required", 401));
  }

  if (!req.user.permissions.canManageBuses) {
    return next(new ApiError("Bus management permission is required", 403));
  }

  next();
};

/**
 * Middleware to check if user can manage routes
 */
const canManageRoutes = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("Authentication required", 401));
  }

  if (!req.user.permissions.canManageRoutes) {
    return next(new ApiError("Route management permission is required", 403));
  }

  next();
};

/**
 * Middleware to check if user can view reports
 */
const canViewReports = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("Authentication required", 401));
  }

  if (!req.user.permissions.canViewReports) {
    return next(new ApiError("Report viewing permission is required", 403));
  }

  next();
};

/**
 * Middleware to ensure user account is fully verified
 */
const requireVerifiedAccount = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("Authentication required", 401));
  }

  if (!req.user.emailVerified) {
    return next(new ApiError("Email verification is required", 403));
  }

  if (req.user.status === "pending") {
    return next(new ApiError("Account approval is pending", 403));
  }

  next();
};

/**
 * Middleware to validate organization context for bus operators
 */
const validateOperatorContext = async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("Authentication required", 401));
  }

  if (req.user.role === "bus_operator") {
    if (!req.user.organizationDetails?.operatorLicense) {
      return next(
        new ApiError("Operator license information is required", 400)
      );
    }
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  ownerOrAdmin,
  roleBasedRateLimit,
  canManageUsers,
  canManageBuses,
  canManageRoutes,
  canViewReports,
  requireVerifiedAccount,
  validateOperatorContext,
};
