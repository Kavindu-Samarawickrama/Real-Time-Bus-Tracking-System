// src/routes/tripRoutes.js
const express = require("express");
const tripController = require("../controllers/tripController");
const {
  authenticate,
  authorize,
  canManageRoutes,
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

// Public routes (authenticated users can view trips)
router.get("/", generalLimiter, asyncHandler(tripController.getTrips));

router.get(
  "/active",
  generalLimiter,
  asyncHandler(tripController.getActiveTrips)
);

router.get(
  "/delayed",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(tripController.getDelayedTrips)
);

router.get(
  "/upcoming",
  generalLimiter,
  asyncHandler(tripController.getUpcomingTrips)
);

router.get(
  "/search/nearby",
  generalLimiter,
  asyncHandler(tripController.findTripsByLocation)
);

router.get(
  "/operator/:operatorId",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(tripController.getTripsByOperator)
);

router.get(
  "/route/:routeId",
  generalLimiter,
  asyncHandler(tripController.getTripsByRoute)
);

router.get(
  "/bus/:busId",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(tripController.getTripsByBus)
);

router.get(
  "/my-trips",
  authorize("bus_operator"),
  generalLimiter,
  asyncHandler(tripController.getMyTrips)
);

router.get(
  "/number/:tripNumber",
  generalLimiter,
  asyncHandler(tripController.getTripByNumber)
);

router.get(
  "/incidents",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(tripController.getTripsWithIncidents)
);

router.get(
  "/:tripId",
  generalLimiter,
  asyncHandler(tripController.getTripById)
);

// Trip creation and management (Bus operators and admins)
router.post(
  "/",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.createTrip)
);

router.post(
  "/search/advanced",
  generalLimiter,
  asyncHandler(tripController.advancedSearch)
);

router.post(
  "/generate-schedule",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.generateRecurringTrips)
);

// Trip updates (Operators can update their own trips, admins can update any)
router.put(
  "/:tripId",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.updateTrip)
);

router.patch(
  "/:tripId/status",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.updateTripStatus)
);

router.patch(
  "/:tripId/location",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(tripController.updateTripLocation)
);

router.patch(
  "/:tripId/tracking",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(tripController.updateLiveTracking)
);

router.post(
  "/:tripId/incidents",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.addIncident)
);

router.patch(
  "/:tripId/waypoints",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.updateWaypoint)
);

router.post(
  "/:tripId/passengers",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.addPassengerActivity)
);

router.post(
  "/:tripId/ratings",
  authorize("commuter"),
  requireVerifiedAccount,
  generalLimiter,
  asyncHandler(tripController.addRating)
);

router.patch(
  "/:tripId/revenue",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.updateTripRevenue)
);

router.post(
  "/:tripId/cancel",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.cancelTrip)
);

router.post(
  "/:tripId/complete",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(tripController.completeTrip)
);

// Admin-only routes
router.get(
  "/admin/statistics",
  canManageRoutes,
  generalLimiter,
  asyncHandler(tripController.getTripStatistics)
);

router.get(
  "/admin/analytics",
  canManageRoutes,
  generalLimiter,
  asyncHandler(tripController.getTripAnalytics)
);

router.put(
  "/admin/bulk/status",
  canManageRoutes,
  strictLimiter,
  asyncHandler(tripController.bulkUpdateStatus)
);

router.delete(
  "/:tripId",
  canManageRoutes,
  strictLimiter,
  asyncHandler(tripController.deleteTrip)
);

module.exports = router;
