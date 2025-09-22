// src/controllers/tripController.js
const tripService = require("../services/tripService");
const { validateSchema } = require("../middlewares/validation");
const {
  createTripSchema,
  updateTripSchema,
  updateStatusSchema,
  updateLocationSchema,
  tripQuerySchema,
  tripSearchSchema,
  bulkUpdateStatusSchema,
  passengerActivitySchema,
  addRatingSchema,
  updateRevenueSchema,
  updateWaypointSchema,
  tripAnalyticsSchema,
  generateScheduleSchema,
  liveTrackingSchema,
  incidentSchema,
} = require("../validators/tripValidator");
const { ApiError } = require("../utils/errors");
const { successResponse } = require("../utils/response");

class TripController {
  /**
   * Create a new trip
   */
  async createTrip(req, res, next) {
    try {
      const validatedData = await validateSchema(createTripSchema, req.body);

      const trip = await tripService.createTrip(validatedData, req.user.id);

      res
        .status(201)
        .json(successResponse(trip, "Trip created successfully", 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all trips with filters
   */
  async getTrips(req, res, next) {
    try {
      const options = await validateSchema(tripQuerySchema, req.query);

      const result = await tripService.getTrips(options);

      res.json(successResponse(result, "Trips retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trip by ID
   */
  async getTripById(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const trip = await tripService.getTripById(tripId);

      res.json(successResponse(trip, "Trip retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trip by trip number
   */
  async getTripByNumber(req, res, next) {
    try {
      const { tripNumber } = req.params;

      if (!tripNumber || tripNumber.trim().length === 0) {
        throw new ApiError("Trip number is required", 400);
      }

      const trip = await tripService.getTripByNumber(tripNumber.trim());

      res.json(successResponse(trip, "Trip retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update trip
   */
  async updateTrip(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const validatedData = await validateSchema(updateTripSchema, req.body);

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const trip = await tripService.updateTrip(
        tripId,
        validatedData,
        req.user.id
      );

      res.json(successResponse(trip, "Trip updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update trip status
   */
  async updateTripStatus(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const { status, updateData } = await validateSchema(
        updateStatusSchema,
        req.body
      );

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const trip = await tripService.updateTripStatus(
        tripId,
        status,
        updateData,
        req.user.id
      );

      res.json(successResponse(trip, "Trip status updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete trip
   */
  async deleteTrip(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      // Check permissions (admin only for trip deletion)
      await tripService.validateTripPermissions(req.user.id, tripId, "delete");

      const result = await tripService.deleteTrip(tripId, req.user.id);

      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trips by operator
   */
  async getTripsByOperator(req, res, next) {
    try {
      const { operatorId } = req.params;
      const { status, dateFrom, dateTo } = req.query;

      if (!operatorId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid operator ID format", 400);
      }

      const dateFromParsed = dateFrom ? new Date(dateFrom) : null;
      const dateToParsed = dateTo ? new Date(dateTo) : null;

      const trips = await tripService.getTripsByOperator(
        operatorId,
        status,
        dateFromParsed,
        dateToParsed
      );

      res.json(
        successResponse(trips, "Trips by operator retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my trips (for bus operators)
   */
  async getMyTrips(req, res, next) {
    try {
      const { status, dateFrom, dateTo } = req.query;

      const options = {
        status,
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
      };

      const trips = await tripService.getMyTrips(req.user.id, options);

      res.json(successResponse(trips, "Your trips retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trips by route
   */
  async getTripsByRoute(req, res, next) {
    try {
      const { routeId } = req.params;
      const { dateFrom, dateTo } = req.query;

      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid route ID format", 400);
      }

      const dateFromParsed = dateFrom ? new Date(dateFrom) : null;
      const dateToParsed = dateTo ? new Date(dateTo) : null;

      const trips = await tripService.getTripsByRoute(
        routeId,
        dateFromParsed,
        dateToParsed
      );

      res.json(successResponse(trips, "Trips by route retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trips by bus
   */
  async getTripsByBus(req, res, next) {
    try {
      const { busId } = req.params;
      const { dateFrom, dateTo } = req.query;

      if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid bus ID format", 400);
      }

      const dateFromParsed = dateFrom ? new Date(dateFrom) : null;
      const dateToParsed = dateTo ? new Date(dateTo) : null;

      const trips = await tripService.getTripsByBus(
        busId,
        dateFromParsed,
        dateToParsed
      );

      res.json(successResponse(trips, "Trips by bus retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active trips
   */
  async getActiveTrips(req, res, next) {
    try {
      const trips = await tripService.getActiveTrips();

      res.json(successResponse(trips, "Active trips retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get delayed trips
   */
  async getDelayedTrips(req, res, next) {
    try {
      const { threshold = 15 } = req.query;
      const thresholdMinutes = parseInt(threshold);

      if (isNaN(thresholdMinutes) || thresholdMinutes < 1) {
        throw new ApiError("Threshold must be a positive number", 400);
      }

      const trips = await tripService.getDelayedTrips(thresholdMinutes);

      res.json(successResponse(trips, "Delayed trips retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Advanced trip search
   */
  async advancedSearch(req, res, next) {
    try {
      const searchParams = await validateSchema(tripSearchSchema, req.body);
      const result = await tripService.advancedSearch(searchParams);

      res.json(successResponse(result, "Trip search completed successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update trip location
   */
  async updateTripLocation(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const locationData = await validateSchema(updateLocationSchema, req.body);

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const trip = await tripService.updateTripLocation(tripId, locationData);

      res.json(successResponse(trip, "Trip location updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update trip location with live tracking data
   */
  async updateLiveTracking(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const trackingData = await validateSchema(liveTrackingSchema, req.body);

      const locationData = {
        coordinates: trackingData.coordinates,
        speed: trackingData.speed,
        heading: trackingData.heading,
        timestamp: trackingData.timestamp,
      };

      const trip = await tripService.updateTripLocation(tripId, locationData);

      res.json(
        successResponse(trip, "Live tracking data updated successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find trips by location
   */
  async findTripsByLocation(req, res, next) {
    try {
      const { latitude, longitude, radius, status } = req.query;

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
      const trips = await tripService.findTripsByLocation(
        coordinates,
        radiusKm,
        status
      );

      res.json(successResponse(trips, "Nearby trips retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add incident to trip
   */
  async addIncident(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const incidentData = await validateSchema(incidentSchema, req.body);

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const trip = await tripService.addIncident(
        tripId,
        incidentData,
        req.user.id
      );

      res.json(successResponse(trip, "Incident added successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update waypoint status
   */
  async updateWaypoint(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const updateData = await validateSchema(updateWaypointSchema, req.body);

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const trip = await tripService.updateWaypoint(
        tripId,
        updateData.waypointRef,
        updateData
      );

      res.json(successResponse(trip, "Waypoint updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add passenger activity
   */
  async addPassengerActivity(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const activityData = await validateSchema(
        passengerActivitySchema,
        req.body
      );

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const trip = await tripService.addPassengerActivity(
        tripId,
        activityData.waypointRef,
        activityData
      );

      res.json(successResponse(trip, "Passenger activity added successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add rating to trip
   */
  async addRating(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const ratingData = await validateSchema(addRatingSchema, req.body);

      const trip = await tripService.addRating(tripId, req.user.id, ratingData);

      res.json(successResponse(trip, "Rating added successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update trip revenue
   */
  async updateTripRevenue(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const revenueData = await validateSchema(updateRevenueSchema, req.body);

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const trip = await tripService.updateTripRevenue(
        tripId,
        revenueData,
        req.user.id
      );

      res.json(successResponse(trip, "Trip revenue updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trip statistics
   */
  async getTripStatistics(req, res, next) {
    try {
      const { operator, dateFrom, dateTo } = req.query;

      const operatorId =
        operator && operator.match(/^[0-9a-fA-F]{24}$/) ? operator : null;
      const dateFromParsed = dateFrom ? new Date(dateFrom) : null;
      const dateToParsed = dateTo ? new Date(dateTo) : null;

      const stats = await tripService.getTripStatistics(
        operatorId,
        dateFromParsed,
        dateToParsed
      );

      res.json(
        successResponse(stats, "Trip statistics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update trip status
   */
  async bulkUpdateStatus(req, res, next) {
    try {
      const { tripIds, status, reason } = await validateSchema(
        bulkUpdateStatusSchema,
        req.body
      );

      const result = await tripService.bulkUpdateStatus(
        tripIds,
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
   * Generate recurring trips
   */
  async generateRecurringTrips(req, res, next) {
    try {
      const scheduleData = await validateSchema(
        generateScheduleSchema,
        req.body
      );

      const trips = await tripService.generateRecurringTrips(
        scheduleData,
        req.user.id
      );

      res.json(
        successResponse(
          trips,
          `${trips.length} recurring trips generated successfully`
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming trips
   */
  async getUpcomingTrips(req, res, next) {
    try {
      const { hours = 24, limit = 50 } = req.query;
      const hoursNumber = parseInt(hours);
      const limitNumber = parseInt(limit);

      if (isNaN(hoursNumber) || hoursNumber < 1 || hoursNumber > 168) {
        throw new ApiError("Hours must be between 1 and 168 (1 week)", 400);
      }

      if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
        throw new ApiError("Limit must be between 1 and 100", 400);
      }

      const trips = await tripService.getUpcomingTrips(
        hoursNumber,
        limitNumber
      );

      res.json(successResponse(trips, "Upcoming trips retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trip analytics
   */
  async getTripAnalytics(req, res, next) {
    try {
      const filters = await validateSchema(tripAnalyticsSchema, req.query);

      const analytics = await tripService.getTripAnalytics(filters);

      res.json(
        successResponse(analytics, "Trip analytics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel trip
   */
  async cancelTrip(req, res, next) {
    try {
      const { tripId } = req.params;
      const { reason } = req.body;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      if (!reason || reason.trim().length === 0) {
        throw new ApiError("Cancellation reason is required", 400);
      }

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const result = await tripService.cancelTrip(
        tripId,
        reason.trim(),
        req.user.id
      );

      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete trip
   */
  async completeTrip(req, res, next) {
    try {
      const { tripId } = req.params;

      if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid trip ID format", 400);
      }

      const { actualArrival, revenue } = req.body;

      // Check permissions
      await tripService.validateTripPermissions(req.user.id, tripId, "update");

      const completionData = {
        actualArrival: actualArrival ? new Date(actualArrival) : null,
        revenue,
      };

      const result = await tripService.completeTrip(
        tripId,
        completionData,
        req.user.id
      );

      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trips with incidents
   */
  async getTripsWithIncidents(req, res, next) {
    try {
      const { severity, resolved } = req.query;

      const resolvedBool = resolved !== undefined ? resolved === "true" : null;

      const trips = await tripService.getTripsWithIncidents(
        severity,
        resolvedBool
      );

      res.json(
        successResponse(trips, "Trips with incidents retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TripController();
