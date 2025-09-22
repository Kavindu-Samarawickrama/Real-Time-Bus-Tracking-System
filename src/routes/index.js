// src/routes/index.js
const express = require("express");
const userRoutes = require("./userRoutes");
const routeRoutes = require("./routeRoutes");
const busRoutes = require("./busRoutes");
const tripRoutes = require("./tripRoutes");

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "NTC Bus Tracking API is running",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "v1",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

// API version info
router.get("/info", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "NTC Bus Tracking API",
      version: process.env.API_VERSION || "v1",
      description:
        "National Transport Commission - Real-Time Bus Tracking System",
      environment: process.env.NODE_ENV || "development",
      author: "NTC Development Team",
    },
  });
});

// Mount routes
router.use("/users", userRoutes);
router.use("/routes", routeRoutes);
router.use("/buses", busRoutes);
router.use("/trips", tripRoutes);

// Root endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NTC Bus Tracking API",
    version: process.env.API_VERSION || "v1",
    documentation: "/api/docs",
    health: "/api/health",
    endpoints: {
      users: "/api/users",
      routes: "/api/routes",
      buses: "/api/buses",
      trips: "/api/trips",
      health: "/api/health",
      info: "/api/info",
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
