// src/services/tripService.js
const tripRepository = require("../repositories/tripRepository");
const userRepository = require("../repositories/userRepository");
const routeRepository = require("../repositories/routeRepository");
const busRepository = require("../repositories/busRepository");
const { ApiError } = require("../utils/errors");
const logger = require("../utils/logger");

class TripService {
  /**
   * Create a new trip
   */
  async createTrip(tripData, createdBy) {
    try {
      // Validate route exists and is active
      const route = await routeRepository.findById(tripData.route, false);
      if (!route || route.status !== "active") {
        throw new ApiError("Route must be active", 400);
      }

      // Validate bus exists and is available
      const bus = await busRepository.findById(tripData.bus, false);
      if (!bus || bus.status !== "active") {
        throw new ApiError("Bus must be active", 400);
      }

      // Validate operator exists and is active
      const operator = await userRepository.findById(tripData.operator);
      if (
        !operator ||
        operator.role !== "bus_operator" ||
        operator.status !== "active"
      ) {
        throw new ApiError("Operator must be an active bus operator", 400);
      }

      // Check if bus is assigned to the route
      if (bus.operationalDetails.assignedRoute?.toString() !== tripData.route) {
        throw new ApiError("Bus is not assigned to this route", 400);
      }

      // Check if operator is authorized for this route
      const isAuthorized = route.operatedBy.some(
        (op) => op.toString() === tripData.operator
      );
      if (!isAuthorized) {
        throw new ApiError("Operator is not authorized for this route", 403);
      }

      // Check for bus scheduling conflicts
      const conflictingTrips = await this.checkBusAvailability(
        tripData.bus,
        tripData.schedule.scheduledDeparture,
        tripData.schedule.scheduledArrival
      );

      if (conflictingTrips.length > 0) {
        throw new ApiError(
          "Bus is not available during the scheduled time",
          409
        );
      }

      // Set capacity from bus data
      tripData.capacity = {
        totalSeats: bus.capacity.totalSeats,
        bookedSeats: 0,
        availableSeats: bus.capacity.totalSeats,
        standingPassengers: 0,
      };

      // Add creator to trip data
      const enrichedTripData = {
        ...tripData,
        createdBy,
        status: "scheduled",
      };

      const trip = await tripRepository.create(enrichedTripData);

      logger.info(
        `New trip created: ${trip.tripNumber} for route ${route.routeNumber} by user ${createdBy}`
      );

      return trip;
    } catch (error) {
      logger.error("Trip creation failed:", error);
      throw error;
    }
  }

  /**
   * Get trip by ID
   */
  async getTripById(tripId) {
    try {
      const trip = await tripRepository.findById(tripId);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      return trip;
    } catch (error) {
      logger.error("Get trip by ID failed:", error);
      throw error;
    }
  }

  /**
   * Get trip by trip number
   */
  async getTripByNumber(tripNumber) {
    try {
      const trip = await tripRepository.findByTripNumber(tripNumber);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      return trip;
    } catch (error) {
      logger.error("Get trip by number failed:", error);
      throw error;
    }
  }

  /**
   * Update trip
   */
  async updateTrip(tripId, updateData, updatedBy) {
    try {
      const existingTrip = await tripRepository.findById(tripId, false);

      if (!existingTrip) {
        throw new ApiError("Trip not found", 404);
      }

      // Validate business rules for updates
      if (
        existingTrip.status === "completed" ||
        existingTrip.status === "cancelled"
      ) {
        throw new ApiError("Cannot update completed or cancelled trips", 400);
      }

      // Validate route if being changed
      if (
        updateData.route &&
        updateData.route !== existingTrip.route.toString()
      ) {
        const route = await routeRepository.findById(updateData.route, false);
        if (!route || route.status !== "active") {
          throw new ApiError("Route must be active", 400);
        }
      }

      // Validate bus availability if schedule is being changed
      if (updateData.schedule) {
        const conflictingTrips = await this.checkBusAvailability(
          existingTrip.bus,
          updateData.schedule.scheduledDeparture ||
            existingTrip.schedule.scheduledDeparture,
          updateData.schedule.scheduledArrival ||
            existingTrip.schedule.scheduledArrival,
          tripId // Exclude current trip from conflict check
        );

        if (conflictingTrips.length > 0) {
          throw new ApiError(
            "Bus is not available during the updated schedule",
            409
          );
        }
      }

      // Add updater info
      const enrichedUpdateData = {
        ...updateData,
        lastModifiedBy: updatedBy,
      };

      const updatedTrip = await tripRepository.updateById(
        tripId,
        enrichedUpdateData
      );

      logger.info(
        `Trip updated: ${updatedTrip.tripNumber} by user ${updatedBy}`
      );

      return updatedTrip;
    } catch (error) {
      logger.error("Update trip failed:", error);
      throw error;
    }
  }

  /**
   * Update trip status
   */
  async updateTripStatus(tripId, status, updateData, updatedBy) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // Validate status transition
      this.validateStatusTransition(trip.status, status);

      // Use the model's updateStatus method
      const updatedTrip = await trip.updateStatus(status, updateData);

      // Send notifications for important status changes
      try {
        const route = await routeRepository.findById(trip.route);

        if (status === "delayed") {
          // Notify about delays
          const delayMinutes = updateData.delayMinutes || "Unknown";
          await notificationService.createNotification(
            {
              type: "trip_delay",
              priority: delayMinutes > 30 ? "high" : "normal",
              title: "Trip Delayed",
              message: `Trip ${trip.tripNumber} on route ${route.routeNumber} (${route.origin.city} → ${route.destination.city}) has been delayed by ${delayMinutes} minutes.`,
              recipients: {
                groups: ["route_subscribers", "commuters"],
              },
              relatedData: {
                trip: trip._id,
                route: trip.route,
                bus: trip.bus,
              },
              metadata: {
                source: "automated",
                category: "trip_status",
              },
            },
            updatedBy
          );
        } else if (status === "cancelled") {
          // Notify about cancellations
          await notificationService.createNotification(
            {
              type: "trip_cancellation",
              priority: "high",
              title: "Trip Cancelled",
              message: `Trip ${trip.tripNumber} on route ${
                route.routeNumber
              } (${route.origin.city} → ${
                route.destination.city
              }) has been cancelled. ${
                updateData.reason ? `Reason: ${updateData.reason}` : ""
              }`,
              recipients: {
                groups: ["route_subscribers", "commuters"],
              },
              relatedData: {
                trip: trip._id,
                route: trip.route,
                bus: trip.bus,
              },
              metadata: {
                source: "automated",
                category: "trip_status",
              },
            },
            updatedBy
          );
        } else if (status === "departed") {
          // Notify about departures
          await notificationService.createNotification(
            {
              type: "trip_departure",
              priority: "normal",
              title: "Trip Departed",
              message: `Trip ${trip.tripNumber} has departed from ${route.origin.city} and is on its way to ${route.destination.city}.`,
              recipients: {
                groups: ["route_subscribers"],
              },
              relatedData: {
                trip: trip._id,
                route: trip.route,
                bus: trip.bus,
              },
              metadata: {
                source: "automated",
                category: "trip_status",
              },
            },
            updatedBy
          );
        } else if (status === "arrived") {
          // Notify about arrivals
          await notificationService.createNotification(
            {
              type: "trip_arrival",
              priority: "normal",
              title: "Trip Arrived",
              message: `Trip ${trip.tripNumber} has arrived at ${route.destination.city}.`,
              recipients: {
                groups: ["route_subscribers"],
              },
              relatedData: {
                trip: trip._id,
                route: trip.route,
                bus: trip.bus,
              },
              metadata: {
                source: "automated",
                category: "trip_status",
              },
            },
            updatedBy
          );
        }
      } catch (notificationError) {
        logger.warn(
          "Failed to send trip status notification:",
          notificationError
        );
      }

      logger.info(
        `Trip status updated: ${trip.tripNumber} → ${status} by user ${updatedBy}`
      );

      return updatedTrip;
    } catch (error) {
      logger.error("Update trip status failed:", error);
      throw error;
    }
  }

  /**
   * Delete trip
   */
  async deleteTrip(tripId, deletedBy) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // Only allow deletion of scheduled trips
      if (trip.status !== "scheduled") {
        throw new ApiError("Only scheduled trips can be deleted", 400);
      }

      await tripRepository.deleteById(tripId);

      logger.info(`Trip deleted: ${trip.tripNumber} by user ${deletedBy}`);

      return { message: "Trip deleted successfully" };
    } catch (error) {
      logger.error("Delete trip failed:", error);
      throw error;
    }
  }

  /**
   * Get trips with filters
   */
  async getTrips(options) {
    try {
      const result = await tripRepository.findWithFilters({}, options);
      return result;
    } catch (error) {
      logger.error("Get trips list failed:", error);
      throw error;
    }
  }

  /**
   * Get trips by operator
   */
  async getTripsByOperator(
    operatorId,
    status = null,
    dateFrom = null,
    dateTo = null
  ) {
    try {
      // Verify operator exists
      const operator = await userRepository.findById(operatorId);
      if (!operator || operator.role !== "bus_operator") {
        throw new ApiError("Invalid operator or not a bus operator", 400);
      }

      const trips = await tripRepository.findByOperator(
        operatorId,
        status,
        dateFrom,
        dateTo
      );
      return trips;
    } catch (error) {
      logger.error("Get trips by operator failed:", error);
      throw error;
    }
  }

  /**
   * Get trips by route
   */
  async getTripsByRoute(routeId, dateFrom = null, dateTo = null) {
    try {
      // Verify route exists
      const route = await routeRepository.findById(routeId, false);
      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      const trips = await tripRepository.findByRoute(routeId, dateFrom, dateTo);
      return trips;
    } catch (error) {
      logger.error("Get trips by route failed:", error);
      throw error;
    }
  }

  /**
   * Get trips by bus
   */
  async getTripsByBus(busId, dateFrom = null, dateTo = null) {
    try {
      // Verify bus exists
      const bus = await busRepository.findById(busId, false);
      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      const trips = await tripRepository.findByBus(busId, dateFrom, dateTo);
      return trips;
    } catch (error) {
      logger.error("Get trips by bus failed:", error);
      throw error;
    }
  }

  /**
   * Get active trips
   */
  async getActiveTrips() {
    try {
      const trips = await tripRepository.findActiveTrips();
      return trips;
    } catch (error) {
      logger.error("Get active trips failed:", error);
      throw error;
    }
  }

  /**
   * Get delayed trips
   */
  async getDelayedTrips(thresholdMinutes = 15) {
    try {
      const trips = await tripRepository.findDelayedTrips(thresholdMinutes);
      return trips;
    } catch (error) {
      logger.error("Get delayed trips failed:", error);
      throw error;
    }
  }

  /**
   * Advanced trip search
   */
  async advancedSearch(searchParams) {
    try {
      const result = await tripRepository.advancedSearch(searchParams);
      return result;
    } catch (error) {
      logger.error("Advanced trip search failed:", error);
      throw error;
    }
  }

  /**
   * Update trip location
   */
  async updateTripLocation(tripId, locationData) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // Only allow location updates for active trips
      if (!["boarding", "departed", "in_transit"].includes(trip.status)) {
        throw new ApiError(
          "Location can only be updated for active trips",
          400
        );
      }

      const updatedTrip = await trip.updateLocation(locationData);

      return updatedTrip;
    } catch (error) {
      logger.error("Update trip location failed:", error);
      throw error;
    }
  }

  /**
   * Add incident to trip
   */
  async addIncident(tripId, incidentData, reportedBy) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      const enrichedIncident = {
        ...incidentData,
        reportedBy,
        timestamp: incidentData.timestamp || new Date(),
      };

      const updatedTrip = await tripRepository.addIncident(
        tripId,
        enrichedIncident
      );

      // Auto-update trip status for severe incidents
      if (incidentData.severity === "critical" && trip.status !== "cancelled") {
        await this.updateTripStatus(tripId, "delayed", {}, reportedBy);
      }

      // Send notifications for incidents
      try {
        const route = await routeRepository.findById(trip.route);
        let priority = "normal";
        let recipients = ["ntc_admins"];

        if (incidentData.severity === "critical") {
          priority = "critical";
          recipients = ["ntc_admins", "route_subscribers"];
        } else if (incidentData.severity === "high") {
          priority = "high";
          recipients = ["ntc_admins"];
        }

        await notificationService.createNotification(
          {
            type: "incident_report",
            priority,
            title: `Trip Incident - ${incidentData.type}`,
            message: `Incident reported on trip ${trip.tripNumber} (${route.origin.city} → ${route.destination.city}): ${incidentData.description}`,
            recipients: {
              groups: recipients,
            },
            relatedData: {
              trip: trip._id,
              route: trip.route,
              bus: trip.bus,
              operator: trip.operator,
              incident: incidentData._id,
            },
            metadata: {
              source: "automated",
              category: "incident",
            },
          },
          reportedBy
        );
      } catch (notificationError) {
        logger.warn("Failed to send incident notification:", notificationError);
      }

      logger.info(
        `Incident added to trip ${trip.tripNumber}: ${incidentData.type} - ${incidentData.description}`
      );

      return updatedTrip;
    } catch (error) {
      logger.error("Add incident failed:", error);
      throw error;
    }
  }

  /**
   * Update waypoint status
   */
  async updateWaypoint(tripId, waypointRef, updateData) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      const updatedTrip = await tripRepository.updateWaypoint(
        tripId,
        waypointRef,
        updateData
      );

      if (!updatedTrip) {
        throw new ApiError("Waypoint not found in trip", 404);
      }

      return updatedTrip;
    } catch (error) {
      logger.error("Update waypoint failed:", error);
      throw error;
    }
  }

  /**
   * Add passenger activity
   */
  async addPassengerActivity(tripId, waypointRef, activityData) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // Update passenger counts
      const netChange =
        (activityData.boarded || 0) - (activityData.alighted || 0);
      const newBookedSeats = Math.max(0, trip.capacity.bookedSeats + netChange);

      if (newBookedSeats > trip.capacity.totalSeats) {
        throw new ApiError("Passenger count would exceed bus capacity", 400);
      }

      // Update waypoint passenger activity
      await tripRepository.addPassengerActivity(
        tripId,
        waypointRef,
        activityData
      );

      // Update trip capacity
      const updatedTrip = await tripRepository.updateById(tripId, {
        "capacity.bookedSeats": newBookedSeats,
        "capacity.availableSeats": trip.capacity.totalSeats - newBookedSeats,
      });

      return updatedTrip;
    } catch (error) {
      logger.error("Add passenger activity failed:", error);
      throw error;
    }
  }

  /**
   * Add rating to trip
   */
  async addRating(tripId, userId, ratingData) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // Only allow ratings for completed trips
      if (trip.status !== "completed") {
        throw new ApiError("Ratings can only be added to completed trips", 400);
      }

      // Check if user already rated this trip
      const existingRating = trip.ratings.reviews.find(
        (review) => review.user.toString() === userId
      );

      if (existingRating) {
        throw new ApiError("You have already rated this trip", 400);
      }

      const updatedTrip = await tripRepository.addRating(
        tripId,
        userId,
        ratingData
      );

      // Recalculate average ratings
      await this.recalculateTripRatings(tripId);

      return updatedTrip;
    } catch (error) {
      logger.error("Add rating failed:", error);
      throw error;
    }
  }

  /**
   * Get trip statistics
   */
  async getTripStatistics(operatorId = null, dateFrom = null, dateTo = null) {
    try {
      const stats = await tripRepository.getTripStats(
        operatorId,
        dateFrom,
        dateTo
      );
      const recentTrips = await tripRepository.getRecentTrips(7, 5);
      const activeTrips = await tripRepository.findActiveTrips();
      const delayedTrips = await tripRepository.findDelayedTrips();

      return {
        tripStats: stats,
        recentTrips,
        activeTrips: activeTrips.length,
        delayedTrips: delayedTrips.length,
        totalActiveTrips: activeTrips.length,
      };
    } catch (error) {
      logger.error("Get trip statistics failed:", error);
      throw error;
    }
  }

  /**
   * Bulk update trip status
   */
  async bulkUpdateStatus(tripIds, status, reason, updatedBy) {
    try {
      // Verify all trips exist
      const trips = await Promise.all(
        tripIds.map((id) => tripRepository.findById(id, false))
      );

      const notFoundTrips = trips.filter((trip) => !trip);
      if (notFoundTrips.length > 0) {
        throw new ApiError("One or more trips not found", 404);
      }

      // Validate status transitions
      trips.forEach((trip) => {
        this.validateStatusTransition(trip.status, status);
      });

      const result = await tripRepository.bulkUpdate(
        { _id: { $in: tripIds } },
        { status, lastModifiedBy: updatedBy }
      );

      logger.info(
        `Bulk status update: ${
          result.modifiedCount
        } trips updated to ${status} by ${updatedBy}${
          reason ? ` (Reason: ${reason})` : ""
        }`
      );

      return {
        message: `${result.modifiedCount} trips updated successfully`,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      logger.error("Bulk update trip status failed:", error);
      throw error;
    }
  }

  /**
   * Generate recurring trips
   */
  async generateRecurringTrips(scheduleData, createdBy) {
    try {
      // Validate required resources
      const [route, bus, operator] = await Promise.all([
        routeRepository.findById(scheduleData.route, false),
        busRepository.findById(scheduleData.bus, false),
        userRepository.findById(scheduleData.operator),
      ]);

      if (!route || route.status !== "active") {
        throw new ApiError("Route must be active", 400);
      }

      if (!bus || bus.status !== "active") {
        throw new ApiError("Bus must be active", 400);
      }

      if (
        !operator ||
        operator.role !== "bus_operator" ||
        operator.status !== "active"
      ) {
        throw new ApiError("Operator must be an active bus operator", 400);
      }

      // Add creator information
      const enrichedScheduleData = {
        ...scheduleData,
        createdBy,
      };

      const trips = await tripRepository.generateRecurringTrips(
        enrichedScheduleData
      );

      logger.info(
        `Generated ${trips.length} recurring trips for route ${route.routeNumber} by ${createdBy}`
      );

      return trips;
    } catch (error) {
      logger.error("Generate recurring trips failed:", error);
      throw error;
    }
  }

  /**
   * Get upcoming trips
   */
  async getUpcomingTrips(hours = 24, limit = 50) {
    try {
      const trips = await tripRepository.findUpcomingTrips(hours, limit);
      return trips;
    } catch (error) {
      logger.error("Get upcoming trips failed:", error);
      throw error;
    }
  }

  /**
   * Find trips by location
   */
  async findTripsByLocation(coordinates, radiusKm = 50, status = null) {
    try {
      const trips = await tripRepository.findByLocation(
        coordinates,
        radiusKm,
        status
      );
      return trips;
    } catch (error) {
      logger.error("Find trips by location failed:", error);
      throw error;
    }
  }

  /**
   * Get trip analytics
   */
  async getTripAnalytics(filters) {
    try {
      const analytics = await tripRepository.findForAnalytics(filters);
      return analytics;
    } catch (error) {
      logger.error("Get trip analytics failed:", error);
      throw error;
    }
  }

  /**
   * Validate user permissions for trip operations
   */
  async validateTripPermissions(userId, tripId, operation) {
    try {
      const user = await userRepository.findById(userId);
      const trip = await tripRepository.findById(tripId, false);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // NTC admins can perform any operation
      if (user.role === "ntc_admin") {
        return true;
      }

      // Bus operators can manage their own trips
      if (user.role === "bus_operator") {
        const isOperator = trip.operator.toString() === userId;

        if (!isOperator) {
          throw new ApiError("You can only manage trips you operate", 403);
        }

        return true;
      }

      // Commuters can only view and rate trips
      if (user.role === "commuter") {
        if (["view", "rate"].includes(operation)) {
          return true;
        }
        throw new ApiError("Insufficient permissions for this operation", 403);
      }

      throw new ApiError("Insufficient permissions to manage trips", 403);
    } catch (error) {
      logger.error("Validate trip permissions failed:", error);
      throw error;
    }
  }

  /**
   * Helper method to check bus availability
   */
  async checkBusAvailability(busId, startTime, endTime, excludeTripId = null) {
    const query = {
      bus: busId,
      status: { $nin: ["cancelled", "completed"] },
      $or: [
        {
          "schedule.scheduledDeparture": { $lt: endTime },
          "schedule.scheduledArrival": { $gt: startTime },
        },
      ],
    };

    if (excludeTripId) {
      query._id = { $ne: excludeTripId };
    }

    return await tripRepository.findWithFilters(query, { limit: 1 });
  }

  /**
   * Helper method to validate status transition
   */
  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      scheduled: ["boarding", "delayed", "cancelled"],
      boarding: ["departed", "delayed", "cancelled"],
      departed: ["in_transit", "delayed", "arrived"],
      in_transit: ["arrived", "delayed"],
      delayed: ["boarding", "departed", "in_transit", "arrived", "cancelled"],
      arrived: ["completed"],
      completed: [], // No transitions allowed from completed
      cancelled: [], // No transitions allowed from cancelled
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ApiError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }

  /**
   * Helper method to recalculate trip ratings
   */
  async recalculateTripRatings(tripId) {
    const trip = await tripRepository.findById(tripId, false);

    if (!trip || trip.ratings.reviews.length === 0) return;

    const ratings = trip.ratings.reviews;
    const totalRatings = ratings.length;

    const averages = {
      overall: ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings,
      punctuality: 0,
      comfort: 0,
      driverBehavior: 0,
      cleanliness: 0,
    };

    // Calculate specific category averages if available
    ["punctuality", "comfort", "driverBehavior", "cleanliness"].forEach(
      (category) => {
        const categoryRatings = ratings.filter((r) => r[category]);
        if (categoryRatings.length > 0) {
          averages[category] =
            categoryRatings.reduce((sum, r) => sum + r[category], 0) /
            categoryRatings.length;
        }
      }
    );

    await tripRepository.updateById(tripId, {
      "ratings.overall": Math.round(averages.overall * 10) / 10,
      "ratings.punctuality": Math.round(averages.punctuality * 10) / 10,
      "ratings.comfort": Math.round(averages.comfort * 10) / 10,
      "ratings.driverBehavior": Math.round(averages.driverBehavior * 10) / 10,
      "ratings.cleanliness": Math.round(averages.cleanliness * 10) / 10,
      "ratings.totalRatings": totalRatings,
    });
  }

  /**
   * Get my trips (for bus operators)
   */
  async getMyTrips(userId, options = {}) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      if (user.role !== "bus_operator") {
        throw new ApiError("Only bus operators can access this endpoint", 403);
      }

      const trips = await tripRepository.findByOperator(
        userId,
        options.status,
        options.dateFrom,
        options.dateTo
      );

      return trips;
    } catch (error) {
      logger.error("Get my trips failed:", error);
      throw error;
    }
  }

  /**
   * Update trip revenue
   */
  async updateTripRevenue(tripId, revenueData, updatedBy) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      const updatedTrip = await tripRepository.updateRevenue(
        tripId,
        revenueData
      );

      logger.info(
        `Trip revenue updated: ${trip.tripNumber} by user ${updatedBy}`
      );

      return updatedTrip;
    } catch (error) {
      logger.error("Update trip revenue failed:", error);
      throw error;
    }
  }

  /**
   * Get trips with incidents
   */
  async getTripsWithIncidents(severity = null, resolved = null) {
    try {
      const trips = await tripRepository.findTripsWithIncidents(
        severity,
        resolved
      );
      return trips;
    } catch (error) {
      logger.error("Get trips with incidents failed:", error);
      throw error;
    }
  }

  /**
   * Cancel trip
   */
  async cancelTrip(tripId, reason, cancelledBy) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // Only allow cancellation of scheduled, boarding, or delayed trips
      if (!["scheduled", "boarding", "delayed"].includes(trip.status)) {
        throw new ApiError("Trip cannot be cancelled in current status", 400);
      }

      await this.updateTripStatus(tripId, "cancelled", { reason }, cancelledBy);

      // Add incident record for cancellation
      await this.addIncident(
        tripId,
        {
          type: "other",
          description: `Trip cancelled: ${reason}`,
          severity: "medium",
          resolved: true,
          resolvedAt: new Date(),
        },
        cancelledBy
      );

      logger.info(
        `Trip cancelled: ${trip.tripNumber} by ${cancelledBy}. Reason: ${reason}`
      );

      return { message: "Trip cancelled successfully" };
    } catch (error) {
      logger.error("Cancel trip failed:", error);
      throw error;
    }
  }

  /**
   * Complete trip
   */
  async completeTrip(tripId, completionData, completedBy) {
    try {
      const trip = await tripRepository.findById(tripId, false);

      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      // Only allow completion of arrived trips
      if (trip.status !== "arrived") {
        throw new ApiError(
          "Trip must be in 'arrived' status to be completed",
          400
        );
      }

      // Update to completed status
      await this.updateTripStatus(
        tripId,
        "completed",
        {
          actualArrival: completionData.actualArrival || new Date(),
        },
        completedBy
      );

      // Update revenue if provided
      if (completionData.revenue) {
        await this.updateTripRevenue(
          tripId,
          completionData.revenue,
          completedBy
        );
      }

      logger.info(`Trip completed: ${trip.tripNumber} by ${completedBy}`);

      return { message: "Trip completed successfully" };
    } catch (error) {
      logger.error("Complete trip failed:", error);
      throw error;
    }
  }
}

module.exports = new TripService();
