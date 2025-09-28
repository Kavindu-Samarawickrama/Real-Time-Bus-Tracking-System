// src/services/trackingService.js
const trackingRepository = require("../repositories/trackingRepository");
const tripRepository = require("../repositories/tripRepository");
const busRepository = require("../repositories/busRepository");
const routeRepository = require("../repositories/routeRepository");
const notificationService = require("./notificationService");
const { ApiError } = require("../utils/errors");
const logger = require("../utils/logger");

class TrackingService {
  /**
   * Start tracking session for a trip
   */
  async startTracking(trackingData, createdBy) {
    try {
      // Validate trip exists and is active
      const trip = await tripRepository.findById(trackingData.trip);
      if (!trip) {
        throw new ApiError("Trip not found", 404);
      }

      if (!["scheduled", "boarding", "departed"].includes(trip.status)) {
        throw new ApiError(
          "Trip must be scheduled, boarding, or departed to start tracking",
          400
        );
      }

      // Validate bus exists and is assigned to trip
      const bus = await busRepository.findById(trackingData.bus);
      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      if (trip.bus.toString() !== trackingData.bus) {
        throw new ApiError("Bus must match trip assignment", 400);
      }

      // Check if tracking session already exists for this trip
      const existingTracking = await trackingRepository.findByTrip(
        trackingData.trip
      );
      if (existingTracking && existingTracking.status !== "completed") {
        throw new ApiError(
          "Active tracking session already exists for this trip",
          409
        );
      }

      // Get route information
      const route = await routeRepository.findById(trip.route);
      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      // Set up geofences based on route waypoints
      const geofences = this.createRouteGeofences(route);

      // Enrich tracking data
      const enrichedTrackingData = {
        ...trackingData,
        route: trip.route,
        geofences,
        metadata: {
          startTime: new Date(),
          version: "1.0",
          dataPoints: 0,
        },
        settings: {
          updateInterval: 30, // 30 seconds default
          trackingAccuracy: "high",
          alertsEnabled: true,
          shareLocation: true,
        },
        createdBy,
      };

      const tracking = await trackingRepository.create(enrichedTrackingData);

      // Update trip status if needed
      if (trip.status === "scheduled") {
        await tripRepository.updateById(trip._id, { status: "boarding" });
      }

      logger.info(
        `Tracking started for trip ${trip.tripNumber} with tracking ID ${tracking.trackingId}`
      );

      return tracking;
    } catch (error) {
      logger.error("Start tracking failed:", error);
      throw error;
    }
  }

  /**
   * Update location for tracking session
   */
  async updateLocation(trackingId, locationData, validateLocation = true) {
    try {
      const tracking = await trackingRepository.findById(trackingId, false);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      if (!["active", "paused"].includes(tracking.status)) {
        throw new ApiError(
          "Cannot update location for inactive tracking session",
          400
        );
      }

      // Validate location data
      if (validateLocation) {
        this.validateLocationData(locationData);
      }

      // Check for speed violations
      if (locationData.speed > 80) {
        // 80 km/h speed limit for buses
        await this.addSpeedViolationAlert(tracking, locationData.speed);
      }

      // Update location in tracking
      const updatedTracking = await trackingRepository.updateLocation(
        trackingId,
        locationData
      );

      // Check geofences
      await this.checkGeofenceViolations(updatedTracking);

      // Update route progress
      await this.updateRouteProgress(updatedTracking);

      // Broadcast location update via WebSocket
      this.broadcastLocationUpdate(updatedTracking);

      return updatedTracking;
    } catch (error) {
      logger.error("Update location failed:", error);
      throw error;
    }
  }

  /**
   * Get current tracking status
   */
  async getTrackingStatus(trackingId) {
    try {
      const tracking = await trackingRepository.findById(trackingId);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      return {
        trackingId: tracking.trackingId,
        status: tracking.status,
        currentLocation: tracking.realTimeData.currentLocation,
        performance: tracking.performance,
        routeProgress: tracking.routeProgress,
        lastUpdate: tracking.realTimeData.timestamp,
        isOnline: tracking.isCurrentlyOnline,
        emergencyStatus: tracking.inEmergency,
        alerts: tracking.alerts.filter((alert) => !alert.resolved).length,
      };
    } catch (error) {
      logger.error("Get tracking status failed:", error);
      throw error;
    }
  }

  /**
   * Stop tracking session
   */
  async stopTracking(trackingId, reason = "Trip completed", stoppedBy) {
    try {
      const tracking = await trackingRepository.findById(trackingId);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      if (tracking.status === "completed") {
        throw new ApiError("Tracking session already completed", 400);
      }

      // Complete the tracking session
      const completedTracking = await trackingRepository.completeSession(
        trackingId
      );

      // Update trip status if applicable
      const trip = await tripRepository.findById(tracking.trip);
      if (trip && trip.status !== "completed") {
        await tripRepository.updateById(trip._id, {
          status: "completed",
          "schedule.actualArrival": new Date(),
        });
      }

      // Generate tracking summary
      const summary = this.generateTrackingSummary(completedTracking);

      logger.info(
        `Tracking stopped for trip ${
          trip?.tripNumber || "N/A"
        }: ${reason} by ${stoppedBy}`
      );

      return {
        message: "Tracking session completed successfully",
        summary,
        tracking: completedTracking,
      };
    } catch (error) {
      logger.error("Stop tracking failed:", error);
      throw error;
    }
  }

  /**
   * Get active tracking sessions
   */
  async getActiveTrackingSessions(options = {}) {
    try {
      const result = await trackingRepository.findWithFilters(
        {
          status: { $in: ["active", "paused", "emergency"] },
        },
        options
      );

      return result;
    } catch (error) {
      logger.error("Get active tracking sessions failed:", error);
      throw error;
    }
  }

  /**
   * Get tracking sessions with filters
   */
  async getTrackingSessions(options) {
    try {
      const result = await trackingRepository.findWithFilters({}, options);
      return result;
    } catch (error) {
      logger.error("Get tracking sessions failed:", error);
      throw error;
    }
  }

  /**
   * Get tracking session by trip
   */
  async getTrackingByTrip(tripId) {
    try {
      const tracking = await trackingRepository.findByTrip(tripId);
      if (!tracking) {
        throw new ApiError(
          "No active tracking session found for this trip",
          404
        );
      }
      return tracking;
    } catch (error) {
      logger.error("Get tracking by trip failed:", error);
      throw error;
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getDashboardData() {
    try {
      const dashboardData = await trackingRepository.getDashboardData();

      // Add additional analytics
      const analytics = await this.getTrackingAnalytics();

      return {
        ...dashboardData,
        analytics,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error("Get dashboard data failed:", error);
      throw error;
    }
  }

  /**
   * Get location history
   */
  async getLocationHistory(trackingId, hoursBack = 24) {
    try {
      return await trackingRepository.getLocationHistory(trackingId, hoursBack);
    } catch (error) {
      logger.error("Get location history failed:", error);
      throw error;
    }
  }

  /**
   * Trigger emergency alert
   */
  async triggerEmergency(trackingId, emergencyData, triggeredBy) {
    try {
      const tracking = await trackingRepository.findById(trackingId);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      // Trigger emergency in tracking
      const updatedTracking = await trackingRepository.triggerEmergency(
        trackingId,
        emergencyData
      );

      // Send emergency notifications
      await this.sendEmergencyNotifications(
        updatedTracking,
        emergencyData,
        triggeredBy
      );

      // Broadcast emergency alert
      this.broadcastEmergencyAlert(updatedTracking);

      logger.error(
        `Emergency triggered for tracking ${tracking.trackingId}: ${emergencyData.type} - ${emergencyData.description}`
      );

      return {
        message: "Emergency alert triggered successfully",
        tracking: updatedTracking,
      };
    } catch (error) {
      logger.error("Trigger emergency failed:", error);
      throw error;
    }
  }

  /**
   * Resolve emergency
   */
  async resolveEmergency(trackingId, resolution, resolvedBy) {
    try {
      const tracking = await trackingRepository.findById(trackingId);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      if (!tracking.inEmergency) {
        throw new ApiError("No active emergency to resolve", 400);
      }

      // Update emergency data
      const updateData = {
        status: "active", // Reset to active
        "emergencyData.panicButtonPressed": false,
        "emergencyData.currentEmergency.status": "resolved",
      };

      const updatedTracking = await trackingRepository.updateById(
        trackingId,
        updateData
      );

      // Send resolution notifications
      await this.sendEmergencyResolutionNotifications(
        updatedTracking,
        resolution,
        resolvedBy
      );

      logger.info(
        `Emergency resolved for tracking ${tracking.trackingId} by ${resolvedBy}: ${resolution}`
      );

      return {
        message: "Emergency resolved successfully",
        tracking: updatedTracking,
      };
    } catch (error) {
      logger.error("Resolve emergency failed:", error);
      throw error;
    }
  }

  /**
   * Add tracking alert
   */
  async addAlert(trackingId, alertData, reportedBy) {
    try {
      const enrichedAlertData = {
        ...alertData,
        timestamp: alertData.timestamp || new Date(),
      };

      const updatedTracking = await trackingRepository.addAlert(
        trackingId,
        enrichedAlertData
      );

      // Send alert notifications based on severity
      if (["high", "critical"].includes(alertData.severity)) {
        await this.sendAlertNotifications(
          updatedTracking,
          alertData,
          reportedBy
        );
      }

      return updatedTracking;
    } catch (error) {
      logger.error("Add tracking alert failed:", error);
      throw error;
    }
  }

  /**
   * Get tracking analytics
   */
  async getTrackingAnalytics(dateFrom = null, dateTo = null) {
    try {
      const stats = await trackingRepository.getTrackingStats(dateFrom, dateTo);

      const summary = {
        totalSessions: 0,
        avgSessionDuration: 0,
        totalDistance: 0,
        avgSpeed: 0,
        totalAlerts: 0,
        emergencyCount: 0,
      };

      stats.forEach((stat) => {
        stat.statuses.forEach((statusData) => {
          summary.totalSessions += statusData.count;
          summary.totalDistance += statusData.totalDistance || 0;
          summary.totalAlerts += statusData.totalAlerts || 0;
          summary.emergencyCount += statusData.emergencyCount || 0;

          if (statusData.avgSpeed) {
            summary.avgSpeed = (summary.avgSpeed + statusData.avgSpeed) / 2;
          }
        });
      });

      return {
        summary,
        dailyStats: stats,
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      };
    } catch (error) {
      logger.error("Get tracking analytics failed:", error);
      throw error;
    }
  }

  /**
   * Update heartbeat
   */
  async updateHeartbeat(trackingId, deviceInfo = {}) {
    try {
      return await trackingRepository.updateHeartbeat(trackingId, deviceInfo);
    } catch (error) {
      logger.error("Update heartbeat failed:", error);
      throw error;
    }
  }

  /**
   * Find buses by location
   */
  async findBusesByLocation(coordinates, radiusKm = 50) {
    try {
      const trackingSessions = await trackingRepository.findByLocation(
        coordinates,
        radiusKm
      );

      return trackingSessions.map((session) => ({
        bus: session.bus,
        trip: session.trip,
        route: session.route,
        location: session.realTimeData.currentLocation,
        speed: session.realTimeData.speed,
        heading: session.realTimeData.heading,
        lastUpdate: session.realTimeData.timestamp,
        distance: this.calculateDistance(
          coordinates[1],
          coordinates[0],
          session.realTimeData.currentLocation.coordinates[1],
          session.realTimeData.currentLocation.coordinates[0]
        ),
      }));
    } catch (error) {
      logger.error("Find buses by location failed:", error);
      throw error;
    }
  }

  /**
   * Get offline buses
   */
  async getOfflineBuses(minutesThreshold = 10) {
    try {
      return await trackingRepository.findOffline(minutesThreshold);
    } catch (error) {
      logger.error("Get offline buses failed:", error);
      throw error;
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(trackingId, alertId, acknowledgedBy) {
    try {
      return await trackingRepository.acknowledgeAlert(
        trackingId,
        alertId,
        acknowledgedBy
      );
    } catch (error) {
      logger.error("Acknowledge alert failed:", error);
      throw error;
    }
  }

  /**
   * Helper method to validate location data
   */
  validateLocationData(locationData) {
    const required = ["coordinates", "timestamp"];
    const missing = required.filter((field) => !locationData[field]);

    if (missing.length > 0) {
      throw new ApiError(
        `Missing required location fields: ${missing.join(", ")}`,
        400
      );
    }

    const [longitude, latitude] = locationData.coordinates;

    if (!longitude || !latitude) {
      throw new ApiError("Invalid coordinates format", 400);
    }

    // Validate Sri Lanka bounds
    if (
      latitude < 5.9 ||
      latitude > 9.9 ||
      longitude < 79.6 ||
      longitude > 81.9
    ) {
      throw new ApiError(
        "Location coordinates are outside Sri Lanka bounds",
        400
      );
    }

    // Validate speed if provided
    if (
      locationData.speed &&
      (locationData.speed < 0 || locationData.speed > 120)
    ) {
      throw new ApiError("Speed must be between 0-120 km/h", 400);
    }
  }

  /**
   * Helper method to create route geofences
   */
  createRouteGeofences(route) {
    const geofences = [];

    // Origin terminal
    geofences.push({
      name: `${route.origin.city} Terminal`,
      type: "terminal",
      coordinates: [
        route.origin.coordinates.longitude,
        route.origin.coordinates.latitude,
      ],
      radius: 200, // 200 meters
      alerts: { onEntry: true, onExit: true },
    });

    // Destination terminal
    geofences.push({
      name: `${route.destination.city} Terminal`,
      type: "terminal",
      coordinates: [
        route.destination.coordinates.longitude,
        route.destination.coordinates.latitude,
      ],
      radius: 200,
      alerts: { onEntry: true, onExit: true },
    });

    // Waypoints
    if (route.waypoints) {
      route.waypoints.forEach((waypoint, index) => {
        geofences.push({
          name: waypoint.name,
          type: "waypoint",
          coordinates: [
            waypoint.coordinates.longitude,
            waypoint.coordinates.latitude,
          ],
          radius: 150, // 150 meters for waypoints
          alerts: { onEntry: true, onExit: false },
        });
      });
    }

    return geofences;
  }

  /**
   * Helper method to add speed violation alert
   */
  async addSpeedViolationAlert(tracking, speed) {
    const alertData = {
      type: "speed_violation",
      severity: speed > 100 ? "critical" : "high",
      message: `Speed violation detected: ${speed} km/h (Limit: 80 km/h)`,
      location: {
        coordinates: tracking.realTimeData.currentLocation.coordinates,
        address: tracking.realTimeData.address,
      },
    };

    await trackingRepository.addAlert(tracking._id, alertData);
  }

  /**
   * Helper method to check geofence violations
   */
  async checkGeofenceViolations(tracking) {
    // This would be implemented in the tracking model's checkGeofences method
    await tracking.checkGeofences();
  }

  /**
   * Helper method to update route progress
   */
  async updateRouteProgress(tracking) {
    // Calculate route progress based on current location and route geometry
    // This is a simplified implementation
    const routeDistance = tracking.route?.distance || 0;
    const distanceCovered = tracking.performance.totalDistance || 0;

    if (routeDistance > 0) {
      const completionPercentage = Math.min(
        100,
        (distanceCovered / routeDistance) * 100
      );

      await trackingRepository.updateById(tracking._id, {
        "routeProgress.completionPercentage": completionPercentage,
        "routeProgress.distanceFromOrigin": distanceCovered,
        "routeProgress.distanceToDestination": Math.max(
          0,
          routeDistance - distanceCovered
        ),
      });
    }
  }

  /**
   * Helper method to broadcast location update
   */
  broadcastLocationUpdate(tracking) {
    // This would integrate with WebSocket service
    // For now, just log the event
    logger.info(
      `Broadcasting location update for tracking ${tracking.trackingId}`
    );

    // Example WebSocket broadcast structure:
    const broadcastData = {
      type: "location_update",
      trackingId: tracking.trackingId,
      tripId: tracking.trip,
      busId: tracking.bus,
      location: tracking.realTimeData.currentLocation,
      speed: tracking.realTimeData.speed,
      heading: tracking.realTimeData.heading,
      timestamp: tracking.realTimeData.timestamp,
    };

    // webSocketService.broadcast('tracking_updates', broadcastData);
  }

  /**
   * Helper method to broadcast emergency alert
   */
  broadcastEmergencyAlert(tracking) {
    logger.error(
      `Broadcasting emergency alert for tracking ${tracking.trackingId}`
    );

    const alertData = {
      type: "emergency_alert",
      trackingId: tracking.trackingId,
      tripId: tracking.trip,
      busId: tracking.bus,
      location: tracking.realTimeData.currentLocation,
      emergency: tracking.emergencyData.currentEmergency,
      timestamp: new Date(),
    };

    // webSocketService.broadcast('emergency_alerts', alertData);
  }

  /**
   * Helper method to send emergency notifications
   */
  async sendEmergencyNotifications(tracking, emergencyData, triggeredBy) {
    try {
      await notificationService.createNotification(
        {
          type: "emergency_alert",
          priority: "critical",
          title: `Emergency Alert - ${emergencyData.type}`,
          message: `Emergency reported for bus ${
            tracking.bus.registrationNumber
          }: ${emergencyData.description}. Location: ${
            tracking.realTimeData.address || "Location not available"
          }`,
          recipients: {
            groups: ["ntc_admins"],
          },
          relatedData: {
            trip: tracking.trip,
            route: tracking.route,
            bus: tracking.bus._id,
          },
          metadata: {
            source: "automated",
            category: "emergency",
          },
        },
        triggeredBy
      );
    } catch (error) {
      logger.error("Failed to send emergency notifications:", error);
    }
  }

  /**
   * Helper method to send emergency resolution notifications
   */
  async sendEmergencyResolutionNotifications(tracking, resolution, resolvedBy) {
    try {
      await notificationService.createNotification(
        {
          type: "system_announcement",
          priority: "normal",
          title: "Emergency Resolved",
          message: `Emergency for bus ${
            tracking.bus?.registrationNumber || "N/A"
          } has been resolved. Resolution: ${resolution}`,
          recipients: {
            groups: ["ntc_admins"],
          },
          relatedData: {
            trip: tracking.trip,
            route: tracking.route,
            bus: tracking.bus._id,
          },
        },
        resolvedBy
      );
    } catch (error) {
      logger.error("Failed to send emergency resolution notifications:", error);
    }
  }

  /**
   * Helper method to send alert notifications
   */
  async sendAlertNotifications(tracking, alertData, reportedBy) {
    try {
      await notificationService.createNotification(
        {
          type: "incident_report",
          priority: alertData.severity === "critical" ? "critical" : "high",
          title: `Tracking Alert - ${alertData.type}`,
          message: alertData.message,
          recipients: {
            groups: ["ntc_admins"],
          },
          relatedData: {
            trip: tracking.trip,
            route: tracking.route,
            bus: tracking.bus._id,
          },
        },
        reportedBy
      );
    } catch (error) {
      logger.error("Failed to send alert notifications:", error);
    }
  }

  /**
   * Helper method to generate tracking summary
   */
  generateTrackingSummary(tracking) {
    return {
      trackingId: tracking.trackingId,
      duration: tracking.currentDuration,
      totalDistance: tracking.performance.totalDistance,
      averageSpeed: tracking.performance.averageSpeed,
      maxSpeed: tracking.performance.maxSpeed,
      dataPoints: tracking.metadata.dataPoints,
      totalAlerts: tracking.alerts.length,
      emergencies: tracking.alerts.filter((a) => a.type === "emergency_button")
        .length,
      routeCompletion: tracking.routeProgress.completionPercentage,
      startTime: tracking.metadata.startTime,
      endTime: tracking.metadata.endTime,
    };
  }

  /**
   * Helper method to calculate distance between coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Helper method to convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Pause tracking session
   */
  async pauseTracking(trackingId, reason, pausedBy) {
    try {
      const tracking = await trackingRepository.findById(trackingId, false);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      if (tracking.status !== "active") {
        throw new ApiError("Only active tracking sessions can be paused", 400);
      }

      const updatedTracking = await trackingRepository.updateById(trackingId, {
        status: "paused",
      });

      logger.info(
        `Tracking paused for ${tracking.trackingId}: ${reason} by ${pausedBy}`
      );

      return updatedTracking;
    } catch (error) {
      logger.error("Pause tracking failed:", error);
      throw error;
    }
  }

  /**
   * Resume tracking session
   */
  async resumeTracking(trackingId, resumedBy) {
    try {
      const tracking = await trackingRepository.findById(trackingId, false);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      if (tracking.status !== "paused") {
        throw new ApiError("Only paused tracking sessions can be resumed", 400);
      }

      const updatedTracking = await trackingRepository.updateById(trackingId, {
        status: "active",
      });

      logger.info(
        `Tracking resumed for ${tracking.trackingId} by ${resumedBy}`
      );

      return updatedTracking;
    } catch (error) {
      logger.error("Resume tracking failed:", error);
      throw error;
    }
  }

  /**
   * Get tracking performance metrics
   */
  async getPerformanceMetrics(trackingId) {
    try {
      return await trackingRepository.getPerformanceMetrics(trackingId);
    } catch (error) {
      logger.error("Get performance metrics failed:", error);
      throw error;
    }
  }

  /**
   * Update tracking settings
   */
  async updateTrackingSettings(trackingId, settings, updatedBy) {
    try {
      const tracking = await trackingRepository.findById(trackingId, false);
      if (!tracking) {
        throw new ApiError("Tracking session not found", 404);
      }

      const updateData = {};
      Object.keys(settings).forEach((key) => {
        updateData[`settings.${key}`] = settings[key];
      });

      const updatedTracking = await trackingRepository.updateById(
        trackingId,
        updateData
      );

      logger.info(
        `Tracking settings updated for ${tracking.trackingId} by ${updatedBy}`
      );

      return updatedTracking;
    } catch (error) {
      logger.error("Update tracking settings failed:", error);
      throw error;
    }
  }

  /**
   * Clean up old tracking data
   */
  async cleanupOldTrackingData(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Find tracking sessions to clean up
      const sessionsToCleanup = await trackingRepository.findWithFilters(
        {
          status: "completed",
          "metadata.endTime": { $lt: cutoffDate },
        },
        { limit: 1000 }
      );

      let cleanedSessions = 0;

      for (const session of sessionsToCleanup.trackingSessions) {
        try {
          // Keep only essential data, remove detailed history
          await trackingRepository.updateById(session._id, {
            $unset: {
              trackingHistory: 1,
              "alerts.0.userAgent": 1,
              "alerts.0.ipAddress": 1,
            },
          });
          cleanedSessions++;
        } catch (error) {
          logger.error(
            `Failed to cleanup session ${session.trackingId}:`,
            error
          );
        }
      }

      logger.info(
        `Cleaned up ${cleanedSessions} old tracking sessions older than ${daysOld} days`
      );

      return {
        cleanedSessions,
        totalFound: sessionsToCleanup.trackingSessions.length,
      };
    } catch (error) {
      logger.error("Cleanup old tracking data failed:", error);
      throw error;
    }
  }

  /**
   * Get tracking sessions by operator
   */
  async getTrackingByOperator(operatorId, options = {}) {
    try {
      return await trackingRepository.findByOperator(
        operatorId,
        options.status
      );
    } catch (error) {
      logger.error("Get tracking by operator failed:", error);
      throw error;
    }
  }

  /**
   * Process offline buses and send alerts
   */
  async processOfflineBuses() {
    try {
      const offlineBuses = await this.getOfflineBuses(15); // 15 minutes threshold

      for (const tracking of offlineBuses) {
        // Add communication loss alert
        await this.addAlert(
          tracking._id,
          {
            type: "communication_loss",
            severity: "high",
            message: `Bus ${tracking.bus.registrationNumber} has lost communication. Last seen: ${tracking.connectivity.lastHeartbeat}`,
            location: {
              coordinates: tracking.realTimeData.currentLocation.coordinates,
              address: tracking.realTimeData.address,
            },
          },
          "system"
        );

        // Update connectivity status
        await trackingRepository.updateById(tracking._id, {
          "connectivity.isOnline": false,
        });
      }

      logger.info(`Processed ${offlineBuses.length} offline buses`);

      return {
        processedBuses: offlineBuses.length,
        offlineBuses: offlineBuses.map((t) => ({
          trackingId: t.trackingId,
          bus: t.bus.registrationNumber,
          lastSeen: t.connectivity.lastHeartbeat,
        })),
      };
    } catch (error) {
      logger.error("Process offline buses failed:", error);
      throw error;
    }
  }
}

module.exports = new TrackingService();
