const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later",
      status: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator based on user role if authenticated
    keyGenerator: (req) => {
      if (req.user && req.rateLimit) {
        return `${req.ip}:${req.user.role}`;
      }
      return req.ip;
    },
    // Skip successful requests for authenticated users
    skipSuccessfulRequests: false,
    // Skip requests for certain endpoints
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.originalUrl === "/health";
    },
  });
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
const authLimiter = createRateLimiter(15 * 60 * 1000, 10); // 10 requests per 15 minutes for auth endpoints
const strictLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes for sensitive operations

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from specific domains in production
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8080",
      "https://nntctransport.site", // Add your domain
      "http://nntctransport.site", // HTTP version
      "https://www.nntctransport.site", // www version
      "http://www.nntctransport.site",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
  ],
};

// Security headers configuration
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

// Custom security middleware
const customSecurityHeaders = (req, res, next) => {
  res.setHeader("X-API-Version", process.env.API_VERSION || "v1");
  res.setHeader("X-Request-ID", req.id || "unknown");
  next();
};

module.exports = {
  helmet: helmet(helmetOptions),
  cors: cors(corsOptions),
  generalLimiter,
  authLimiter,
  strictLimiter,
  customSecurityHeaders,
  createRateLimiter,
};
