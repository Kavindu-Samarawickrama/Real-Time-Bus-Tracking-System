// src/controllers/routeController.js
const routeService = require("../services/routeService");
const { validateSchema } = require("../middlewares/validation");
const {
  createRouteSchema,
  updateRouteSchema,
  updateStatusSchema,
  routeQuerySchema,
  routeSearchSchema,
  bulkUpdateStatusSchema,
} = require("../validators/routeValidator");
const { ApiError } = require("../utils/errors");
const { successResponse } = require("../utils/response");

class RouteController {
  /**
   * Create a new route
   */
  async createRoute(req, res, next) {
    try {
      const validatedData = await validateSchema(createRouteSchema, req.body);
      
      const route = await routeService.createRoute(validatedData, req.user.id);

      res
        .status(201)
        .json(successResponse(route, "Route created successfully", 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all routes with filters
   */
  async getRoutes(req, res, next) {
    try {
      const options = await validateSchema(routeQuerySchema, req.query);
      
      const result = await routeService.getRoutes(options);

      res.json(successResponse(result, "Routes retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get route by ID
   */
  async getRouteById(req, res, next) {
    try {
      const { routeId } = req.params;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      const route = await routeService.getRouteById(routeId);

      res.json(successResponse(route, "Route retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get route by route number
   */
  async getRouteByNumber(req, res, next) {
    try {
      const { routeNumber } = req.params;

      if (!routeNumber || routeNumber.trim().length === 0) {
        throw new ApiError("Route number is required", 400);
      }

      const route = await routeService.getRouteByNumber(routeNumber.trim());

      res.json(successResponse(route, "Route retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update route
   */
  async updateRoute(req, res, next) {
    try {
      const { routeId } = req.params;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      const validatedData = await validateSchema(updateRouteSchema, req.body);

      // Check permissions
      await routeService.validateRoutePermissions(req.user.id, routeId, 'update');

      const route = await routeService.updateRoute(routeId, validatedData, req.user.id);

      res.json(successResponse(route, "Route updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update route status
   */
  async updateRouteStatus(req, res, next) {
    try {
      const { routeId } = req.params;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      const { status, reason } = await validateSchema(updateStatusSchema, req.body);

      // Check permissions
      await routeService.validateRoutePermissions(req.user.id, routeId, 'update');

      const route = await routeService.updateRouteStatus(routeId, status, reason, req.user.id);

      res.json(successResponse(route, "Route status updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete route
   */
  async deleteRoute(req, res, next) {
    try {
      const { routeId } = req.params;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      // Check permissions
      await routeService.validateRoutePermissions(req.user.id, routeId, 'delete');

      const result = await routeService.deleteRoute(routeId, req.user.id);

      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search routes between cities
   */
  async searchRoutesBetweenCities(req, res, next) {
    try {
      const { origin, destination } = req.query;

      if (!origin || !destination) {
        throw new ApiError("Origin and destination cities are required", 400);
      }

      const status = req.query.status || "active";
      const routes = await routeService.searchRoutesBetweenCities(origin, destination, status);

      res.json(successResponse(routes, "Routes found successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get routes by province
   */
  async getRoutesByProvince(req, res, next) {
    try {
      const { province } = req.params;
      const { status = "active" } = req.query;

      const validProvinces = [
        "Western", "Central", "Southern", "Northern", "Eastern",
        "North Western", "North Central", "Uva", "Sabaragamuwa"
      ];

      if (!validProvinces.includes(province)) {
        throw new ApiError("Invalid province specified", 400);
      }

      const routes = await routeService.getRoutesByProvince(province, status);

      res.json(successResponse(routes, `Routes for ${province} province retrieved successfully`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inter-provincial routes
   */
  async getInterProvincialRoutes(req, res, next) {
    try {
      const { status = "active" } = req.query;
      const routes = await routeService.getInterProvincialRoutes(status);

      res.json(successResponse(routes, "Inter-provincial routes retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get routes by operator
   */
  async getRoutesByOperator(req, res, next) {
    try {
      const { operatorId } = req.params;
      const { status } = req.query;

      if (!operatorId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid operator ID format", 400);
      }

      const routes = await routeService.getRoutesByOperator(operatorId, status);

      res.json(successResponse(routes, "Routes by operator retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my routes (for bus operators)
   */
  async getMyRoutes(req, res, next) {
    try {
      const { status } = req.query;
      const routes = await routeService.getMyRoutes(req.user.id, { status });

      res.json(successResponse(routes, "Your routes retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Advanced route search
   */
  async advancedSearch(req, res, next) {
    try {
      const searchParams = await validateSchema(routeSearchSchema, req.body);
      const result = await routeService.advancedSearch(searchParams);

      res.json(successResponse(result, "Route search completed successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get route statistics (Admin only)
   */
  async getRouteStatistics(req, res, next) {
    try {
      const stats = await routeService.getRouteStatistics();

      res.json(successResponse(stats, "Route statistics retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update route status (Admin only)
   */
  async bulkUpdateStatus(req, res, next) {
    try {
      const { routeIds, status, reason } = await validateSchema(bulkUpdateStatusSchema, req.body);

      const result = await routeService.bulkUpdateStatus(routeIds, status, reason, req.user.id);

      res.json(successResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get routes with upcoming departures
   */
  async getRoutesWithUpcomingDepartures(req, res, next) {
    try {
      const routes = await routeService.getRoutesWithUpcomingDepartures();

      res.json(successResponse(routes, "Routes with upcoming departures retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find nearby routes
   */
  async findNearbyRoutes(req, res, next) {
    try {
      const { latitude, longitude, maxDistance } = req.query;

      if (!latitude || !longitude) {
        throw new ApiError("Latitude and longitude are required", 400);
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new ApiError("Invalid coordinates provided", 400);
      }

      // Validate Sri Lankan coordinates
      if (lat < 5.9 || lat > 9.9 || lng < 79.6 || lng > 81.9) {
        throw new ApiError("Coordinates must be within Sri Lankan boundaries", 400);
      }

      const coordinates = { latitude: lat, longitude: lng };
      const distance = maxDistance ? parseInt(maxDistance) : 50000; // Default 50km

      const routes = await routeService.findNearbyRoutes(coordinates, distance);

      res.json(successResponse(routes, "Nearby routes retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get route with departure information
   */
  async getRouteWithDepartureInfo(req, res, next) {
    try {
      const { routeId } = req.params;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      const route = await routeService.getRouteWithDepartureInfo(routeId);

      res.json(successResponse(route, "Route with departure info retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular routes
   */
  async getPopularRoutes(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      
      // This would typically be based on statistics like most trips, highest ratings, etc.
      // For now, we'll return inter-provincial routes sorted by creation date
      const routes = await routeService.getInterProvincialRoutes("active");
      
      // Sort by statistics if available, otherwise by creation date
      const sortedRoutes = routes
        .sort((a, b) => {
          if (a.statistics.totalTrips !== b.statistics.totalTrips) {
            return b.statistics.totalTrips - a.statistics.totalTrips;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, parseInt(limit));

      res.json(successResponse(sortedRoutes, "Popular routes retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate route data (utility endpoint for frontend)
   */
  async validateRouteData(req, res, next) {
    try {
      const validatedData = await validateSchema(createRouteSchema, req.body);
      
      // Additional business logic validations
      let routeNumberAvailable = true;
      try {
        await routeService.getRouteByNumber(validatedData.routeNumber);
        routeNumberAvailable = false; // Route number already exists
      } catch (error) {
        // Route not found, so number is available
        routeNumberAvailable = true;
      }

      const validations = {
        routeNumberAvailable,
        operatorsValid: true, // Would check if all operators exist and are active
        coordinatesValid: true, // Already validated by schema
        scheduleValid: true, // Operating hours make sense
      };

      res.json(successResponse({
        valid: Object.values(validations).every(v => v),
        validations,
        data: validatedData
      }, "Route data validation completed"));
    } catch (error) {
      // Return validation errors in a structured format
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details || [{ message: error.message }],
      });
    }
  }

  /**
   * Get route schedules for a specific date
   */
  async getRouteSchedules(req, res, next) {
    try {
      const { routeId } = req.params;
      const { date } = req.query;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      const targetDate = date ? new Date(date) : new Date();
      
      // Validate date
      if (isNaN(targetDate.getTime())) {
        throw new ApiError("Invalid date format", 400);
      }

      const route = await routeService.getRouteById(routeId);
      
      // Check if route operates on the given day
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[targetDate.getDay()];
      
      if (!route.weeklySchedule[dayOfWeek]) {
        return res.json(successResponse({
          route: route.routeSummary,
          date: targetDate.toISOString().split('T')[0],
          operatesOnThisDay: false,
          schedules: []
        }, "Route does not operate on this day"));
      }

      // Generate schedule for the day
      const schedules = [];
      const [firstHour, firstMinute] = route.operatingHours.firstDeparture.split(':').map(Number);
      const [lastHour, lastMinute] = route.operatingHours.lastDeparture.split(':').map(Number);
      
      const firstDepartureInMinutes = firstHour * 60 + firstMinute;
      const lastDepartureInMinutes = lastHour * 60 + lastMinute;
      
      let currentDepartureInMinutes = firstDepartureInMinutes;
      
      while (currentDepartureInMinutes <= lastDepartureInMinutes) {
        const hours = Math.floor(currentDepartureInMinutes / 60);
        const minutes = currentDepartureInMinutes % 60;
        
        const departureTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Calculate estimated arrival time
        const arrivalTimeInMinutes = currentDepartureInMinutes + route.calculateTotalJourneyTime();
        const arrivalHours = Math.floor(arrivalTimeInMinutes / 60);
        const arrivalMins = arrivalTimeInMinutes % 60;
        const arrivalTime = `${arrivalHours.toString().padStart(2, '0')}:${arrivalMins.toString().padStart(2, '0')}`;
        
        schedules.push({
          departureTime,
          estimatedArrivalTime: arrivalTime,
          journeyDurationMinutes: route.calculateTotalJourneyTime(),
        });
        
        currentDepartureInMinutes += route.operatingHours.frequency;
      }

      res.json(successResponse({
        route: route.routeSummary,
        date: targetDate.toISOString().split('T')[0],
        operatesOnThisDay: true,
        schedules,
        totalDepartures: schedules.length
      }, "Route schedules retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get routes summary (lightweight version for listing)
   */
  async getRoutesSummary(req, res, next) {
    try {
      const { status = "active", province, routeType } = req.query;
      
      const options = {
        status,
        province,
        routeType,
        page: 1,
        limit: 1000, // Get all for summary
        sortBy: "routeNumber",
        sortOrder: "asc"
      };

      const result = await routeService.getRoutes(options);
      
      // Return lightweight summary
      const summary = result.routes.map(route => ({
        _id: route._id,
        routeNumber: route.routeNumber,
        routeName: route.routeName,
        origin: `${route.origin.city}, ${route.origin.province}`,
        destination: `${route.destination.city}, ${route.destination.province}`,
        routeType: route.routeType,
        status: route.status,
        distance: route.distance,
        baseFare: route.fare.baseFare,
        isInterProvincial: route.origin.province !== route.destination.province,
        operatorCount: route.operatedBy.length
      }));

      res.json(successResponse({
        routes: summary,
        totalRoutes: result.pagination.totalRoutes,
        summary: {
          byType: summary.reduce((acc, route) => {
            acc[route.routeType] = (acc[route.routeType] || 0) + 1;
            return acc;
          }, {}),
          byStatus: summary.reduce((acc, route) => {
            acc[route.status] = (acc[route.status] || 0) + 1;
            return acc;
          }, {}),
          interProvincial: summary.filter(r => r.isInterProvincial).length,
          intraProvincial: summary.filter(r => !r.isInterProvincial).length
        }
      }, "Routes summary retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RouteController();