const morgan = require("morgan");
const logger = require("../utils/logger");

// Custom token for user ID
morgan.token("user", (req) => {
  return req.user ? req.user.id : "anonymous";
});

// Custom token for request ID
morgan.token("reqId", (req) => {
  return req.id || "unknown";
});

// Custom format
const logFormat =
  process.env.NODE_ENV === "production"
    ? ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :reqId'
    : ":method :url :status :response-time ms - :res[content-length] bytes";

// Morgan stream
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Skip logging in test environment
const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "test";
};

const requestLogger = morgan(logFormat, { stream, skip });

// Custom request ID middleware
const requestId = (req, res, next) => {
  req.id =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  res.setHeader("X-Request-ID", req.id);
  next();
};

module.exports = {
  requestLogger,
  requestId,
};
