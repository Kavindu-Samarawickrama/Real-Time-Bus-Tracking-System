// src/controllers/busController.js
const busService = require("../services/busService");
const { validateSchema } = require("../middlewares/validation");
const {
  createBusSchema,
  updateBusSchema,
  updateStatusSchema,
  updateLocationSchema,
  busQuerySchema,
  busSearchSchema,
  addMaintenanceRecordSchema,
  bulkUpdateStatusSchema,
  assignRouteSchema,
  unassignRouteSchema,
  fleetStatsSchema,
  assignPersonnelSchema,
  trackingDataSchema,
} = require("../validators/busValidator");
const { ApiError } = require("../utils/errors");
const { successResponse } = require("../utils/response");

class BusController {
  /**
   * Create a new bus
   */
  async createBus(req, res, next) {
    try {
      const validatedData = await validateSchema(createBusSchema, req.body);

      const bus = await busService.createBus(validatedData, req.user.id);

      res
        .status(201)
        .json(successResponse(bus, "Bus created successfully", 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all buses with filters
   */
  async getBuses(req, res, next) {
    try {
      const options = await validateSchema(busQuerySchema, req.query);

      const result = await busService.getBuses(options);

      res.json(successResponse(result, "Buses retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bus by ID
   */
  async getBusById(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const bus = await busService.getBusById(busId);

      res.json(successResponse(bus, "Bus retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bus by registration number
   */
  async getBusByRegistrationNumber(req, res, next) {
    try {
      const { registrationNumber } = req.params;

      if (!registrationNumber || registrationNumber.trim().length === 0) {
        throw new ApiError("Registration number is required", 400);
      }

      const bus = await busService.getBusByRegistrationNumber(
        registrationNumber.trim()
      );

      res.json(successResponse(bus, "Bus retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update bus
   */
  async updateBus(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const validatedData = await validateSchema(updateBusSchema, req.body);

      // Check permissions
      await busService.validateBusPermissions(req.user.id, busId, "update");

      const bus = await busService.updateBus(busId, validatedData, req.user.id);

      res.json(successResponse(bus, "Bus updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update bus status
   */
  async updateBusStatus(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const { status, reason } = await validateSchema(
        updateStatusSchema,
        req.body
      );

      // Check permissions (approval requires admin)
      const operation = status === "active" ? "approve" : "update";
      await busService.validateBusPermissions(req.user.id, busId, operation);

      const bus = await busService.updateBusStatus(
        busId,
        status,
        reason,
        req.user.id
      );

      res.json(successResponse(bus, "Bus status updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete bus (Admin only)
   */
  async deleteBus(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      // Check permissions
      await busService.validateBusPermissions(req.user.id, busId, "delete");

      const result = await busService.deleteBus(busId, req.user.id);

      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get buses by operator
   */
  async getBusesByOperator(req, res, next) {
    try {
      const { operatorId } = req.params;
      const { status } = req.query;

      if (!operatorId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid operator ID format", 400);
      }

      const buses = await busService.getBusesByOperator(operatorId, status);

      res.json(
        successResponse(buses, "Buses by operator retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my buses (for bus operators)
   */
  async getMyBuses(req, res, next) {
    try {
      const { status } = req.query;
      const buses = await busService.getMyBuses(req.user.id, { status });

      res.json(successResponse(buses, "Your buses retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get buses by route
   */
  async getBusesByRoute(req, res, next) {
    try {
      const { routeId } = req.params;
      const { status = "active" } = req.query;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      const buses = await busService.getBusesByRoute(routeId, status);

      res.json(successResponse(buses, "Buses by route retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Advanced bus search
   */
  async advancedSearch(req, res, next) {
    try {
      const searchParams = await validateSchema(busSearchSchema, req.body);
      const result = await busService.advancedSearch(searchParams);

      res.json(successResponse(result, "Bus search completed successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get fleet statistics
   */
  async getFleetStatistics(req, res, next) {
    try {
      const { operator } = await validateSchema(fleetStatsSchema, req.query);
      const stats = await busService.getFleetStatistics(operator);

      res.json(
        successResponse(stats, "Fleet statistics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update bus status (Admin only)
   */
  async bulkUpdateStatus(req, res, next) {
    try {
      const { busIds, status, reason } = await validateSchema(
        bulkUpdateStatusSchema,
        req.body
      );

      const result = await busService.bulkUpdateStatus(
        busIds,
        status,
        reason,
        req.user.id
      );

      res.json(successResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update bus location
   */
  async updateBusLocation(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const locationData = await validateSchema(updateLocationSchema, req.body);

      const bus = await busService.updateBusLocation(busId, locationData);

      res.json(successResponse(bus, "Bus location updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update bus location with GPS tracking data
   */
  async updateTrackingData(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const trackingData = await validateSchema(trackingDataSchema, req.body);

      const locationData = {
        coordinates: trackingData.coordinates,
        speed: trackingData.speed,
        heading: trackingData.heading,
        lastUpdated: trackingData.timestamp,
      };

      const bus = await busService.updateBusLocation(busId, locationData);

      res.json(successResponse(bus, "GPS tracking data updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find buses by location
   */
  async findBusesByLocation(req, res, next) {
    try {
      const { latitude, longitude, radius } = req.query;

      if (!latitude || !longitude) {
        throw new ApiError("Latitude and longitude are required", 400);
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusKm = radius ? parseFloat(radius) : 50;

      if (isNaN(lat) || isNaN(lng)) {
        throw new ApiError("Invalid coordinates provided", 400);
      }

      // Validate Sri Lankan coordinates
      if (lat < 5.9 || lat > 9.9 || lng < 79.6 || lng > 81.9) {
        throw new ApiError(
          "Coordinates must be within Sri Lankan boundaries",
          400
        );
      }

      const coordinates = { latitude: lat, longitude: lng };
      const buses = await busService.findBusesByLocation(coordinates, radiusKm);

      res.json(successResponse(buses, "Nearby buses retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add maintenance record
   */
  async addMaintenanceRecord(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const recordData = await validateSchema(
        addMaintenanceRecordSchema,
        req.body
      );

      // Check permissions
      await busService.validateBusPermissions(req.user.id, busId, "update");

      const bus = await busService.addMaintenanceRecord(
        busId,
        recordData,
        req.user.id
      );

      res.json(successResponse(bus, "Maintenance record added successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bus maintenance history
   */
  async getBusMaintenanceHistory(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const history = await busService.getBusMaintenanceHistory(busId);

      res.json(
        successResponse(history, "Maintenance history retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign route to bus
   */
  async assignRoute(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const { routeId } = await validateSchema(assignRouteSchema, req.body);

      // Check permissions
      await busService.validateBusPermissions(req.user.id, busId, "update");

      const bus = await busService.assignRoute(busId, routeId, req.user.id);

      res.json(successResponse(bus, "Route assigned to bus successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unassign route from bus
   */
  async unassignRoute(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const { reason } = await validateSchema(unassignRouteSchema, req.body);

      // Check permissions
      await busService.validateBusPermissions(req.user.id, busId, "update");

      const bus = await busService.unassignRoute(busId, reason, req.user.id);

      res.json(successResponse(bus, "Route unassigned from bus successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign personnel to bus
   */
  async assignPersonnel(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const personnelData = await validateSchema(
        assignPersonnelSchema,
        req.body
      );

      // Check permissions
      await busService.validateBusPermissions(req.user.id, busId, "update");

      const updateData = {};
      if (personnelData.driver) {
        updateData["operationalDetails.currentDriver"] = personnelData.driver;
      }
      if (personnelData.conductor) {
        updateData["operationalDetails.conductor"] = personnelData.conductor;
      }

      const bus = await busService.updateBus(busId, updateData, req.user.id);

      res.json(successResponse(bus, "Personnel assigned to bus successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get buses needing service
   */
  async getBusesNeedingService(req, res, next) {
    try {
      const buses = await busService.getBusesNeedingService();

      res.json(
        successResponse(buses, "Buses needing service retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get buses with expiring permits
   */
  async getBusesWithExpiringPermits(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const daysNumber = parseInt(days);

      if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 365) {
        throw new ApiError("Days must be a number between 1 and 365", 400);
      }

      const buses = await busService.getBusesWithExpiringPermits(daysNumber);

      res.json(
        successResponse(
          buses,
          "Buses with expiring permits retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bus summary (lightweight version for listing)
   */
  async getBusesSummary(req, res, next) {
    try {
      const { status = "active", operator, route } = req.query;

      const options = {
        status,
        operator,
        route,
        page: 1,
        limit: 1000, // Get all for summary
        sortBy: "registrationNumber",
        sortOrder: "asc",
      };

      const result = await busService.getBuses(options);

      // Return lightweight summary
      const summary = result.buses.map((bus) => ({
        _id: bus._id,
        registrationNumber: bus.registrationNumber,
        make: bus.vehicleDetails.make,
        model: bus.vehicleDetails.model,
        year: bus.vehicleDetails.year,
        totalSeats: bus.capacity.totalSeats,
        totalCapacity: bus.totalCapacity,
        status: bus.status,
        fuelType: bus.vehicleDetails.fuelType,
        assignedRoute: bus.operationalDetails.assignedRoute
          ? {
              _id: bus.operationalDetails.assignedRoute._id,
              routeNumber: bus.operationalDetails.assignedRoute.routeNumber,
              routeName: bus.operationalDetails.assignedRoute.routeName,
            }
          : null,
        operator: {
          _id: bus.operationalDetails.operator._id,
          companyName:
            bus.operationalDetails.operator.organizationDetails?.companyName,
          name: `${bus.operationalDetails.operator.profile.firstName} ${bus.operationalDetails.operator.profile.lastName}`,
        },
        serviceDueStatus: bus.serviceDueStatus,
        complianceStatus: bus.complianceStatus,
      }));

      res.json(
        successResponse(
          {
            buses: summary,
            totalBuses: result.pagination.totalBuses,
            summary: {
              byStatus: summary.reduce((acc, bus) => {
                acc[bus.status] = (acc[bus.status] || 0) + 1;
                return acc;
              }, {}),
              byFuelType: summary.reduce((acc, bus) => {
                acc[bus.fuelType] = (acc[bus.fuelType] || 0) + 1;
                return acc;
              }, {}),
              needingService: summary.filter(
                (b) =>
                  b.serviceDueStatus === "overdue" ||
                  b.serviceDueStatus === "due_soon"
              ).length,
              complianceIssues: summary.filter(
                (b) =>
                  b.complianceStatus === "expired" ||
                  b.complianceStatus === "expiring_soon"
              ).length,
              assigned: summary.filter((b) => b.assignedRoute).length,
              unassigned: summary.filter((b) => !b.assignedRoute).length,
            },
          },
          "Buses summary retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate bus data (utility endpoint for frontend)
   */
  async validateBusData(req, res, next) {
    try {
      const validatedData = await validateSchema(createBusSchema, req.body);

      // Additional business logic validations
      let registrationAvailable = true;
      let permitAvailable = true;

      try {
        await busService.getBusByRegistrationNumber(
          validatedData.registrationNumber
        );
        registrationAvailable = false;
      } catch (error) {
        registrationAvailable = true;
      }

      // Check permit availability (would need a service method)
      // For now, assume it's available if registration is available
      permitAvailable = registrationAvailable;

      const validations = {
        registrationNumberAvailable: registrationAvailable,
        permitNumberAvailable: permitAvailable,
        operatorValid: true, // Would check if operator exists and is active
        routeValid: true, // Would check if assigned route exists and operator is authorized
        complianceValid: true, // All required certificates are not expired
      };

      res.json(
        successResponse(
          {
            valid: Object.values(validations).every((v) => v),
            validations,
            data: validatedData,
          },
          "Bus data validation completed"
        )
      );
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
   * Get bus live tracking data
   */
  async getBusLiveTracking(req, res, next) {
    try {
      const { busId } = req.params;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const bus = await busService.getBusById(busId);

      if (!bus.location.current.coordinates) {
        return res.json(
          successResponse(
            {
              busInfo: {
                registrationNumber: bus.registrationNumber,
                route: bus.operationalDetails.assignedRoute,
                operator: bus.operationalDetails.operator,
              },
              tracking: null,
              message: "No current location data available",
            },
            "Bus tracking data retrieved"
          )
        );
      }

      const trackingData = {
        busInfo: {
          registrationNumber: bus.registrationNumber,
          route: bus.operationalDetails.assignedRoute,
          operator: bus.operationalDetails.operator,
          capacity: bus.capacity,
          amenities: bus.amenities,
        },
        tracking: {
          coordinates: bus.location.current.coordinates,
          speed: bus.location.current.speed,
          heading: bus.location.current.heading,
          lastUpdated: bus.location.current.lastUpdated,
          address: bus.location.current.address,
        },
        status: bus.status,
      };

      res.json(
        successResponse(
          trackingData,
          "Bus live tracking data retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get multiple buses live tracking
   */
  async getMultipleBusesTracking(req, res, next) {
    try {
      const { busIds } = req.body;

      if (!Array.isArray(busIds) || busIds.length === 0) {
        throw new ApiError("Bus IDs array is required", 400);
      }

      if (busIds.length > 50) {
        throw new ApiError("Cannot track more than 50 buses at once", 400);
      }

      // Validate bus ID formats
      const invalidIds = busIds.filter((id) => !id.match(/^[0-9a-fA-F]{24}$/));
      if (invalidIds.length > 0) {
        throw new ApiError("Invalid bus ID format in the list", 400);
      }

      const buses = await Promise.all(
        busIds.map(async (busId) => {
          try {
            const bus = await busService.getBusById(busId);
            return {
              _id: bus._id,
              registrationNumber: bus.registrationNumber,
              route: bus.operationalDetails.assignedRoute,
              operator:
                bus.operationalDetails.operator?.organizationDetails
                  ?.companyName,
              location: bus.location.current,
              status: bus.status,
            };
          } catch (error) {
            return {
              _id: busId,
              error: "Bus not found or access denied",
            };
          }
        })
      );

      res.json(
        successResponse(
          buses,
          "Multiple buses tracking data retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BusController();
