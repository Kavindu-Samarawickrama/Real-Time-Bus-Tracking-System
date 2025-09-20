// src/services/routeService.js
const routeRepository = require("../repositories/routeRepository");
const userRepository = require("../repositories/userRepository");
const { ApiError } = require("../utils/errors");
const logger = require("../utils/logger");

class RouteService {
  /**
   * Create a new route
   */
  async createRoute(routeData, createdBy) {
    try {
      // Check if route number already exists
      const existingRoute = await routeRepository.routeNumberExists(
        routeData.routeNumber
      );
      if (existingRoute) {
        throw new ApiError("Route number already exists", 409);
      }

      // Validate that all operators exist and are bus operators
      const operators = await Promise.all(
        routeData.operatedBy.map((id) => userRepository.findById(id))
      );

      const invalidOperators = operators.filter(
        (op) => !op || op.role !== "bus_operator" || op.status !== "active"
      );
      if (invalidOperators.length > 0) {
        throw new ApiError("All operators must be active bus operators", 400);
      }

      // Validate route doesn't have same origin and destination
      if (
        routeData.origin.city.toLowerCase() ===
          routeData.destination.city.toLowerCase() &&
        routeData.origin.province === routeData.destination.province
      ) {
        throw new ApiError("Origin and destination cannot be the same", 400);
      }

      // Add creator to route data
      const enrichedRouteData = {
        ...routeData,
        createdBy,
        status: "active",
      };

      const route = await routeRepository.create(enrichedRouteData);

      logger.info(
        `New route created: ${route.routeNumber} (${route.origin.city} → ${route.destination.city}) by user ${createdBy}`
      );

      return route;
    } catch (error) {
      logger.error("Route creation failed:", error);
      throw error;
    }
  }

  /**
   * Get route by ID
   */
  async getRouteById(routeId) {
    try {
      const route = await routeRepository.findById(routeId);

      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      return route;
    } catch (error) {
      logger.error("Get route by ID failed:", error);
      throw error;
    }
  }

  /**
   * Get route by route number
   */
  async getRouteByNumber(routeNumber) {
    try {
      const route = await routeRepository.findByRouteNumber(routeNumber);

      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      return route;
    } catch (error) {
      logger.error("Get route by number failed:", error);
      throw error;
    }
  }

  /**
   * Update route
   */
  async updateRoute(routeId, updateData, updatedBy) {
    try {
      const existingRoute = await routeRepository.findById(routeId, false);

      if (!existingRoute) {
        throw new ApiError("Route not found", 404);
      }

      // Validate operators if provided
      if (updateData.operatedBy) {
        const operators = await Promise.all(
          updateData.operatedBy.map((id) => userRepository.findById(id))
        );

        const invalidOperators = operators.filter(
          (op) => !op || op.role !== "bus_operator" || op.status !== "active"
        );
        if (invalidOperators.length > 0) {
          throw new ApiError("All operators must be active bus operators", 400);
        }
      }

      // Add updater info
      const enrichedUpdateData = {
        ...updateData,
        lastModifiedBy: updatedBy,
      };

      const updatedRoute = await routeRepository.updateById(
        routeId,
        enrichedUpdateData
      );

      logger.info(
        `Route updated: ${updatedRoute.routeNumber} by user ${updatedBy}`
      );

      return updatedRoute;
    } catch (error) {
      logger.error("Update route failed:", error);
      throw error;
    }
  }

  /**
   * Update route status
   */
  async updateRouteStatus(routeId, status, reason, updatedBy) {
    try {
      const route = await routeRepository.findById(routeId, false);

      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      const updateData = {
        status,
        lastModifiedBy: updatedBy,
      };

      const updatedRoute = await routeRepository.updateById(
        routeId,
        updateData
      );

      logger.info(
        `Route status updated: ${
          route.routeNumber
        } → ${status} by user ${updatedBy}${
          reason ? ` (Reason: ${reason})` : ""
        }`
      );

      return updatedRoute;
    } catch (error) {
      logger.error("Update route status failed:", error);
      throw error;
    }
  }

  /**
   * Delete route
   */
  async deleteRoute(routeId, deletedBy) {
    try {
      const route = await routeRepository.findById(routeId, false);

      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      // Check if route has active trips (this would be implemented when trip management is added)
      // For now, we'll allow deletion if status is not active
      if (route.status === "active") {
        throw new ApiError(
          "Cannot delete an active route. Please deactivate it first.",
          400
        );
      }

      await routeRepository.deleteById(routeId);

      logger.info(`Route deleted: ${route.routeNumber} by user ${deletedBy}`);

      return { message: "Route deleted successfully" };
    } catch (error) {
      logger.error("Delete route failed:", error);
      throw error;
    }
  }

  /**
   * Get routes with filters
   */
  async getRoutes(options) {
    try {
      const result = await routeRepository.findWithFilters({}, options);
      return result;
    } catch (error) {
      logger.error("Get routes list failed:", error);
      throw error;
    }
  }

  /**
   * Search routes between cities
   */
  async searchRoutesBetweenCities(
    originCity,
    destinationCity,
    status = "active"
  ) {
    try {
      const routes = await routeRepository.findRoutesBetweenCities(
        originCity,
        destinationCity,
        status
      );
      return routes;
    } catch (error) {
      logger.error("Search routes between cities failed:", error);
      throw error;
    }
  }

  /**
   * Get routes by province
   */
  async getRoutesByProvince(province, status = "active") {
    try {
      const routes = await routeRepository.findRoutesByProvince(
        province,
        status
      );
      return routes;
    } catch (error) {
      logger.error("Get routes by province failed:", error);
      throw error;
    }
  }

  /**
   * Get inter-provincial routes
   */
  async getInterProvincialRoutes(status = "active") {
    try {
      const routes = await routeRepository.findInterProvincialRoutes(status);
      return routes;
    } catch (error) {
      logger.error("Get inter-provincial routes failed:", error);
      throw error;
    }
  }

  /**
   * Get routes operated by specific operator
   */
  async getRoutesByOperator(operatorId, status = null) {
    try {
      // Verify operator exists and is a bus operator
      const operator = await userRepository.findById(operatorId);
      if (!operator) {
        throw new ApiError("Operator not found", 404);
      }
      if (operator.role !== "bus_operator") {
        throw new ApiError("User is not a bus operator", 400);
      }

      const routes = await routeRepository.findByOperator(operatorId, status);
      return routes;
    } catch (error) {
      logger.error("Get routes by operator failed:", error);
      throw error;
    }
  }

  /**
   * Advanced route search
   */
  async advancedSearch(searchParams) {
    try {
      const result = await routeRepository.advancedSearch(searchParams);
      return result;
    } catch (error) {
      logger.error("Advanced route search failed:", error);
      throw error;
    }
  }

  /**
   * Get route statistics
   */
  async getRouteStatistics() {
    try {
      const stats = await routeRepository.getRouteStats();
      const recentRoutes = await routeRepository.getRecentRoutes(7, 5);

      return {
        ...stats,
        recentRoutes,
        totalRoutes: stats.routeTypeStats.reduce(
          (acc, stat) => acc + stat.total,
          0
        ),
      };
    } catch (error) {
      logger.error("Get route statistics failed:", error);
      throw error;
    }
  }

  /**
   * Bulk update route status
   */
  async bulkUpdateStatus(routeIds, status, reason, updatedBy) {
    try {
      // Verify all routes exist
      const routes = await Promise.all(
        routeIds.map((id) => routeRepository.findById(id, false))
      );

      const notFoundRoutes = routes.filter((route) => !route);
      if (notFoundRoutes.length > 0) {
        throw new ApiError("One or more routes not found", 404);
      }

      const result = await routeRepository.bulkUpdate(
        { _id: { $in: routeIds } },
        { status, lastModifiedBy: updatedBy }
      );

      logger.info(
        `Bulk status update: ${
          result.modifiedCount
        } routes updated to ${status} by ${updatedBy}${
          reason ? ` (Reason: ${reason})` : ""
        }`
      );

      return {
        message: `${result.modifiedCount} routes updated successfully`,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      logger.error("Bulk update route status failed:", error);
      throw error;
    }
  }

  /**
   * Get routes with upcoming departures
   */
  async getRoutesWithUpcomingDepartures() {
    try {
      const routes = await routeRepository.getRoutesWithUpcomingDepartures();
      return routes;
    } catch (error) {
      logger.error("Get routes with upcoming departures failed:", error);
      throw error;
    }
  }

  /**
   * Find nearby routes
   */
  async findNearbyRoutes(coordinates, maxDistance = 50000) {
    try {
      const routes = await routeRepository.findNearbyRoutes(
        coordinates,
        maxDistance
      );
      return routes;
    } catch (error) {
      logger.error("Find nearby routes failed:", error);
      throw error;
    }
  }

  /**
   * Get route with next departure info
   */
  async getRouteWithDepartureInfo(routeId) {
    try {
      const route = await routeRepository.findById(routeId);

      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      const nextDeparture = route.getNextDeparture();
      const totalJourneyTime = route.calculateTotalJourneyTime();

      return {
        ...route.toJSON(),
        nextDeparture,
        totalJourneyTime,
        hasMoreDeparturesToday: nextDeparture !== null,
      };
    } catch (error) {
      logger.error("Get route with departure info failed:", error);
      throw error;
    }
  }

  /**
   * Validate user permissions for route operations
   */
  async validateRoutePermissions(userId, routeId, operation) {
    try {
      const user = await userRepository.findById(userId);
      const route = await routeRepository.findById(routeId, false);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      // NTC admins can perform any operation
      if (user.role === "ntc_admin") {
        return true;
      }

      // Bus operators can only manage their own routes
      if (user.role === "bus_operator") {
        const isOperator = route.operatedBy.some(
          (op) => op.toString() === userId
        );

        if (!isOperator) {
          throw new ApiError("You can only manage routes you operate", 403);
        }

        // Operators cannot delete routes, only update them
        if (operation === "delete") {
          throw new ApiError("Bus operators cannot delete routes", 403);
        }

        return true;
      }

      // Commuters cannot manage routes
      throw new ApiError("Insufficient permissions to manage routes", 403);
    } catch (error) {
      logger.error("Validate route permissions failed:", error);
      throw error;
    }
  }

  /**
   * Get my routes (for bus operators)
   */
  async getMyRoutes(userId, options = {}) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      if (user.role !== "bus_operator") {
        throw new ApiError("Only bus operators can access this endpoint", 403);
      }

      const routes = await routeRepository.findByOperator(
        userId,
        options.status
      );
      return routes;
    } catch (error) {
      logger.error("Get my routes failed:", error);
      throw error;
    }
  }
}

module.exports = new RouteService();
