// src/routes/routeRoutes.js
const express = require("express");
const routeController = require("../controllers/routeController");
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

// Public routes (authenticated users can view routes)
router.get("/", generalLimiter, asyncHandler(routeController.getRoutes));

router.get(
  "/search/between-cities",
  generalLimiter,
  asyncHandler(routeController.searchRoutesBetweenCities)
);

router.get(
  "/search/nearby",
  generalLimiter,
  asyncHandler(routeController.findNearbyRoutes)
);

router.get(
  "/inter-provincial",
  generalLimiter,
  asyncHandler(routeController.getInterProvincialRoutes)
);

router.get(
  "/popular",
  generalLimiter,
  asyncHandler(routeController.getPopularRoutes)
);

router.get(
  "/upcoming-departures",
  generalLimiter,
  asyncHandler(routeController.getRoutesWithUpcomingDepartures)
);

router.get(
  "/province/:province",
  generalLimiter,
  asyncHandler(routeController.getRoutesByProvince)
);

router.get(
  "/operator/:operatorId",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(routeController.getRoutesByOperator)
);

router.get(
  "/my-routes",
  authorize("bus_operator"),
  generalLimiter,
  asyncHandler(routeController.getMyRoutes)
);

router.get(
  "/number/:routeNumber",
  generalLimiter,
  asyncHandler(routeController.getRouteByNumber)
);

router.get(
  "/:routeId",
  generalLimiter,
  asyncHandler(routeController.getRouteById)
);

router.get(
  "/:routeId/departure-info",
  generalLimiter,
  asyncHandler(routeController.getRouteWithDepartureInfo)
);

router.get(
  "/:routeId/schedules",
  generalLimiter,
  asyncHandler(routeController.getRouteSchedules)
);

router.get(
  "/admin/summary",
  generalLimiter,
  asyncHandler(routeController.getRoutesSummary)
);

// Route creation and management (Bus operators and admins)
router.post(
  "/",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(routeController.createRoute)
);

router.post(
  "/search/advanced",
  generalLimiter,
  asyncHandler(routeController.advancedSearch)
);

router.post(
  "/validate",
  authorize("ntc_admin", "bus_operator"),
  generalLimiter,
  asyncHandler(routeController.validateRouteData)
);

// Route updates (Operators can update their own routes, admins can update any)
router.put(
  "/:routeId",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(routeController.updateRoute)
);

router.patch(
  "/:routeId/status",
  authorize("ntc_admin", "bus_operator"),
  requireVerifiedAccount,
  strictLimiter,
  asyncHandler(routeController.updateRouteStatus)
);

// Admin-only routes
router.get(
  "/admin/statistics",
  canManageRoutes,
  generalLimiter,
  asyncHandler(routeController.getRouteStatistics)
);

router.put(
  "/admin/bulk/status",
  canManageRoutes,
  strictLimiter,
  asyncHandler(routeController.bulkUpdateStatus)
);

router.delete(
  "/:routeId",
  canManageRoutes,
  strictLimiter,
  asyncHandler(routeController.deleteRoute)
);

module.exports = router;
