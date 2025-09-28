// src/routes/trackingRoutes.js
const express = require("express");
const trackingController = require("../controllers/trackingController");
const {
  authenticate,
  authorize,
  requireVerifiedAccount,
} = require("../middlewares/auth");
const {
  generalLimiter,
  strictLimiter,
  authLimiter,
} = require("../middlewares/security");
const { asyncHandler } = require("../middlewares/errorHandler");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// PUBLIC/COMMUTER TRACKING ROUTES
// ============================================

/**
 * @route   GET /api/tracking/nearby
 * @desc    Find buses near a location (for commuters)
 * @access  Public (authenticated)
 */
router.get(
  "/nearby",
  generalLimiter,
  asyncHandler(trackingController.findBusesByLocation)
);

/**
 * @route   GET /api/tracking/trip/:tripId
 * @desc    Get tracking data for a specific trip
 * @access  Public (authenticated)
 */
router.get(
  "/trip/:tripId",
  generalLimiter,
  asyncHandler(trackingController.getTrackingByTrip)
);

/**
 * @route   GET /api/tracking/:trackingId/status
 * @desc    Get current tracking status
 * @access  Public (authenticated)
 */
router.get(
  "/:trackingId/status",
  generalLimiter,
  asyncHandler(trackingController.getTrackingStatus)
);

/**
 * @route   GET /api/tracking/:trackingId/history
 * @desc    Get location history for a tracking session
 * @access  Public (authenticated)
 */
router.get(
  "/:trackingId/history",
  generalLimiter,
  asyncHandler(trackingController.getLocationHistory)
);

// ============================================
// BUS OPERATOR ROUTES
// ============================================

/**
 * @route   POST /api/tracking/start
 * @desc    Start a new tracking session
 * @access  Bus Operator
 */
router.post(
  "/start",
  authorize("bus_operator", "ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.startTracking)
);

/**
 * @route   PUT /api/tracking/:trackingId/location
 * @desc    Update current location
 * @access  Bus Operator
 */
router.put(
  "/:trackingId/location",
  authorize("bus_operator", "ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.updateLocation)
);

/**
 * @route   PUT /api/tracking/:trackingId/heartbeat
 * @desc    Update heartbeat (keep-alive signal)
 * @access  Bus Operator
 */
router.put(
  "/:trackingId/heartbeat",
  authorize("bus_operator", "ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.updateHeartbeat)
);

/**
 * @route   POST /api/tracking/:trackingId/stop
 * @desc    Stop tracking session
 * @access  Bus Operator
 */
router.post(
  "/:trackingId/stop",
  authorize("bus_operator", "ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.stopTracking)
);

/**
 * @route   PUT /api/tracking/:trackingId/pause
 * @desc    Pause tracking session
 * @access  Bus Operator
 */
router.put(
  "/:trackingId/pause",
  authorize("bus_operator", "ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.pauseTracking)
);

/**
 * @route   PUT /api/tracking/:trackingId/resume
 * @desc    Resume tracking session
 * @access  Bus Operator
 */
router.put(
  "/:trackingId/resume",
  authorize("bus_operator", "ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.resumeTracking)
);

/**
 * @route   POST /api/tracking/:trackingId/emergency
 * @desc    Trigger emergency alert
 * @access  Bus Operator
 */
router.post(
  "/:trackingId/emergency",
  authorize("bus_operator", "ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.triggerEmergency)
);

/**
 * @route   PUT /api/tracking/:trackingId/emergency/resolve
 * @desc    Resolve emergency
 * @access  NTC Admin, Bus Operator
 */
router.put(
  "/:trackingId/emergency/resolve",
  authorize("bus_operator", "ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.resolveEmergency)
);

/**
 * @route   POST /api/tracking/:trackingId/alerts
 * @desc    Add a tracking alert
 * @access  Bus Operator
 */
router.post(
  "/:trackingId/alerts",
  authorize("bus_operator", "ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.addAlert)
);

/**
 * @route   PUT /api/tracking/:trackingId/alerts/:alertId/acknowledge
 * @desc    Acknowledge an alert
 * @access  NTC Admin, Bus Operator
 */
router.put(
  "/:trackingId/alerts/:alertId/acknowledge",
  authorize("bus_operator", "ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.acknowledgeAlert)
);

/**
 * @route   GET /api/tracking/my-sessions
 * @desc    Get operator's own tracking sessions
 * @access  Bus Operator
 */
router.get(
  "/my-sessions",
  authorize("bus_operator"),
  generalLimiter,
  asyncHandler(trackingController.getMyTrackingSessions)
);

// ============================================
// NTC ADMIN ROUTES
// ============================================

/**
 * @route   GET /api/tracking
 * @desc    Get all tracking sessions with filters
 * @access  NTC Admin
 */
router.get(
  "/",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getTrackingSessions)
);

/**
 * @route   GET /api/tracking/active
 * @desc    Get active tracking sessions
 * @access  NTC Admin
 */
router.get(
  "/active",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getActiveTrackingSessions)
);

/**
 * @route   GET /api/tracking/dashboard
 * @desc    Get real-time dashboard data
 * @access  NTC Admin
 */
router.get(
  "/dashboard",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getDashboardData)
);

/**
 * @route   GET /api/tracking/offline
 * @desc    Get offline buses
 * @access  NTC Admin
 */
router.get(
  "/offline",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getOfflineBuses)
);

/**
 * @route   GET /api/tracking/analytics
 * @desc    Get tracking analytics
 * @access  NTC Admin
 */
router.get(
  "/analytics",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getTrackingAnalytics)
);

/**
 * @route   GET /api/tracking/:trackingId
 * @desc    Get tracking session by ID
 * @access  NTC Admin
 */
router.get(
  "/:trackingId",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getTrackingById)
);

/**
 * @route   GET /api/tracking/:trackingId/metrics
 * @desc    Get performance metrics
 * @access  NTC Admin
 */
router.get(
  "/:trackingId/metrics",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getPerformanceMetrics)
);

/**
 * @route   PUT /api/tracking/:trackingId/settings
 * @desc    Update tracking settings
 * @access  NTC Admin
 */
router.put(
  "/:trackingId/settings",
  authorize("ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.updateTrackingSettings)
);

/**
 * @route   GET /api/tracking/operator/:operatorId
 * @desc    Get tracking sessions by operator
 * @access  NTC Admin
 */
router.get(
  "/operator/:operatorId",
  authorize("ntc_admin"),
  generalLimiter,
  asyncHandler(trackingController.getTrackingByOperator)
);

/**
 * @route   POST /api/tracking/cleanup
 * @desc    Clean up old tracking data
 * @access  NTC Admin only
 */
router.post(
  "/cleanup",
  authorize("ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.cleanupOldTrackingData)
);

/**
 * @route   POST /api/tracking/process-offline
 * @desc    Process offline buses (system task)
 * @access  NTC Admin only
 */
router.post(
  "/process-offline",
  authorize("ntc_admin"),
  strictLimiter,
  asyncHandler(trackingController.processOfflineBuses)
);

module.exports = router;
