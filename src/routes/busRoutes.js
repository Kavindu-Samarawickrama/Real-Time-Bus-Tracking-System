// src/routes/busRoutes.js
const express = require("express");
const busController = require("../controllers/busController");
const {
  authenticate,
  authorize,
  canManageBuses,
  requireVerifiedAccount,
} = require("../middlewares/auth");
const {
  authLimiter,
  generalLimiter,
  strictLimiter,
} = require("../middlewares/security");
const { asyncHandler } = require("../middlewares/errorHandler");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public routes (authenticated users can view buses)
router.get("/", generalLimiter, asyncHandler(busController.getBuses));

router.get(
  "/search/nearby",
  generalLimiter,
  asyncHandler(busController.findBusesByLocation)
);

router.get(
  "/operator/:operatorId",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(busController.getBusesByOperator)
);

router.get(
  "/route/:routeId",
  generalLimiter,
  asyncHandler(busController.getBusesByRoute)
);

router.get(
  "/my-buses",
  authorize("bus_operator"),
  generalLimiter,
  asyncHandler(busController.getMyBuses)
);

router.get(
  "/registration/:registrationNumber",
  generalLimiter,
  asyncHandler(busController.getBusByRegistrationNumber)
);

router.get(
  "/maintenance/needing-service",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(busController.getBusesNeedingService)
);

router.get(
  "/compliance/expiring-permits",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(busController.getBusesWithExpiringPermits)
);

router.get("/:busId", generalLimiter, asyncHandler(busController.getBusById));

router.get(
  "/:busId/tracking",
  generalLimiter,
  asyncHandler(busController.getBusLiveTracking)
);

router.get(
  "/:busId/maintenance/history",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(busController.getBusMaintenanceHistory)
);

// Bus creation and management (Bus operators and admins)
router.post(
  "/",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(busController.createBus)
);

router.post(
  "/search/advanced",
  generalLimiter,
  asyncHandler(busController.advancedSearch)
);

router.post(
  "/validate",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(busController.validateBusData)
);

router.post(
  "/tracking/multiple",
  generalLimiter,
  asyncHandler(busController.getMultipleBusesTracking)
);

// Bus updates (Operators can update their own buses, admins can update any)
router.put(
  "/:busId",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(busController.updateBus)
);

router.patch(
  "/:busId/status",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(busController.updateBusStatus)
);

router.patch(
  "/:busId/location",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(busController.updateBusLocation)
);

router.patch(
  "/:busId/tracking",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(busController.updateTrackingData)
);

router.post(
  "/:busId/maintenance",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(busController.addMaintenanceRecord)
);

router.post(
  "/:busId/assign-route",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(busController.assignRoute)
);

router.post(
  "/:busId/unassign-route",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(busController.unassignRoute)
);

router.post(
  "/:busId/assign-personnel",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(busController.assignPersonnel)
);

// Admin-only routes
router.get(
  "/admin/statistics",
  canManageBuses,
  generalLimiter,
  asyncHandler(busController.getFleetStatistics)
);

router.get(
  "/admin/summary",
  generalLimiter,
  asyncHandler(busController.getBusesSummary)
);

router.put(
  "/admin/bulk/status",
  canManageBuses,
  strictLimiter,
  asyncHandler(busController.bulkUpdateStatus)
);

router.delete(
  "/:busId",
  canManageBuses,
  strictLimiter,
  asyncHandler(busController.deleteBus)
);

module.exports = router;
