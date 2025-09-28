// src/controllers/trackingController.js
const trackingService = require("../services/trackingService");
const { ApiError } = require("../utils/errors");
const { successResponse } = require("../utils/response");

class TrackingController {
  /**
   * Start tracking session
   */
  async startTracking(req, res, next) {
    try {
      const tracking = await trackingService.startTracking(
        req.body,
        req.user.id
      );

      res.json(
        successResponse(tracking, "Tracking session started successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update location
   */
  async updateLocation(req, res, next) {
    try {
      const { trackingId } = req.params;
      const locationData = req.body;

      const tracking = await trackingService.updateLocation(
        trackingId,
        locationData
      );

      res.json(
        successResponse(
          {
            trackingId: tracking.trackingId,
            currentLocation: tracking.realTimeData.currentLocation,
            speed: tracking.realTimeData.speed,
            timestamp: tracking.realTimeData.timestamp,
          },
          "Location updated successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tracking status
   */
  async getTrackingStatus(req, res, next) {
    try {
      const { trackingId } = req.params;

      const status = await trackingService.getTrackingStatus(trackingId);

      res.json(
        successResponse(status, "Tracking status retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stop tracking session
   */
  async stopTracking(req, res, next) {
    try {
      const { trackingId } = req.params;
      const { reason } = req.body;

      const result = await trackingService.stopTracking(
        trackingId,
        reason,
        req.user.id
      );

      res.json(successResponse(result.summary, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tracking session by ID
   */
  async getTrackingById(req, res, next) {
    try {
      const { trackingId } = req.params;

      const tracking = await trackingService.getTrackingById(trackingId);

      res.json(
        successResponse(tracking, "Tracking session retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tracking sessions with filters
   */
  async getTrackingSessions(req, res, next) {
    try {
      const result = await trackingService.getTrackingSessions(req.query);

      res.json(
        successResponse(
          {
            trackingSessions: result.trackingSessions,
            pagination: result.pagination,
          },
          "Tracking sessions retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active tracking sessions
   */
  async getActiveTrackingSessions(req, res, next) {
    try {
      const result = await trackingService.getActiveTrackingSessions(req.query);

      res.json(
        successResponse(
          {
            trackingSessions: result.trackingSessions,
            pagination: result.pagination,
          },
          "Active tracking sessions retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tracking by trip
   */
  async getTrackingByTrip(req, res, next) {
    try {
      const { tripId } = req.params;

      const tracking = await trackingService.getTrackingByTrip(tripId);

      res.json(
        successResponse(tracking, "Trip tracking retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getDashboardData(req, res, next) {
    try {
      const dashboardData = await trackingService.getDashboardData();

      res.json(
        successResponse(dashboardData, "Dashboard data retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get location history
   */
  async getLocationHistory(req, res, next) {
    try {
      const { trackingId } = req.params;
      const { hours = 24 } = req.query;

      const history = await trackingService.getLocationHistory(
        trackingId,
        parseInt(hours)
      );

      res.json(
        successResponse(history, "Location history retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger emergency
   */
  async triggerEmergency(req, res, next) {
    try {
      const { trackingId } = req.params;
      const emergencyData = req.body;

      const result = await trackingService.triggerEmergency(
        trackingId,
        emergencyData,
        req.user.id
      );

      res.status(201).json(
        successResponse(
          {
            trackingId: result.tracking.trackingId,
            emergencyStatus: result.tracking.inEmergency,
          },
          result.message,
          201
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resolve emergency
   */
  async resolveEmergency(req, res, next) {
    try {
      const { trackingId } = req.params;
      const { resolution } = req.body;

      const result = await trackingService.resolveEmergency(
        trackingId,
        resolution,
        req.user.id
      );

      res.json(
        successResponse(
          {
            trackingId: result.tracking.trackingId,
            emergencyStatus: result.tracking.inEmergency,
          },
          result.message
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add alert
   */
  async addAlert(req, res, next) {
    try {
      const { trackingId } = req.params;
      const alertData = req.body;

      const tracking = await trackingService.addAlert(
        trackingId,
        alertData,
        req.user.id
      );

      res.status(201).json(
        successResponse(
          {
            trackingId: tracking.trackingId,
            alertsCount: tracking.alerts.length,
          },
          "Alert added successfully",
          201
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tracking analytics
   */
  async getTrackingAnalytics(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;

      const analytics = await trackingService.getTrackingAnalytics(
        dateFrom ? new Date(dateFrom) : null,
        dateTo ? new Date(dateTo) : null
      );

      res.json(
        successResponse(analytics, "Tracking analytics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update heartbeat
   */
  async updateHeartbeat(req, res, next) {
    try {
      const { trackingId } = req.params;
      const deviceInfo = req.body;

      await trackingService.updateHeartbeat(trackingId, deviceInfo);

      res.json(
        successResponse(
          {
            trackingId,
            timestamp: new Date(),
          },
          "Heartbeat updated successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find buses by location
   */
  async findBusesByLocation(req, res, next) {
    try {
      const { latitude, longitude, radius = 50 } = req.query;

      if (!latitude || !longitude) {
        throw new ApiError("Latitude and longitude are required", 400);
      }

      const buses = await trackingService.findBusesByLocation(
        [parseFloat(longitude), parseFloat(latitude)],
        parseFloat(radius)
      );

      res.json(
        successResponse(
          {
            buses,
            count: buses.length,
          },
          "Nearby buses retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get offline buses
   */
  async getOfflineBuses(req, res, next) {
    try {
      const { minutes = 10 } = req.query;

      const offlineBuses = await trackingService.getOfflineBuses(
        parseInt(minutes)
      );

      res.json(
        successResponse(
          {
            offlineBuses,
            count: offlineBuses.length,
          },
          "Offline buses retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(req, res, next) {
    try {
      const { trackingId, alertId } = req.params;

      const tracking = await trackingService.acknowledgeAlert(
        trackingId,
        alertId,
        req.user.id
      );

      res.json(
        successResponse(
          {
            trackingId: tracking.trackingId,
            alertId,
            acknowledgedAt: new Date(),
          },
          "Alert acknowledged successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pause tracking
   */
  async pauseTracking(req, res, next) {
    try {
      const { trackingId } = req.params;
      const { reason } = req.body;

      const tracking = await trackingService.pauseTracking(
        trackingId,
        reason,
        req.user.id
      );

      res.json(
        successResponse(
          {
            trackingId: tracking.trackingId,
            status: tracking.status,
          },
          "Tracking session paused successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resume tracking
   */
  async resumeTracking(req, res, next) {
    try {
      const { trackingId } = req.params;

      const tracking = await trackingService.resumeTracking(
        trackingId,
        req.user.id
      );

      res.json(
        successResponse(
          {
            trackingId: tracking.trackingId,
            status: tracking.status,
          },
          "Tracking session resumed successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req, res, next) {
    try {
      const { trackingId } = req.params;

      const metrics = await trackingService.getPerformanceMetrics(trackingId);

      res.json(
        successResponse(metrics, "Performance metrics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update tracking settings
   */
  async updateTrackingSettings(req, res, next) {
    try {
      const { trackingId } = req.params;
      const settings = req.body;

      const tracking = await trackingService.updateTrackingSettings(
        trackingId,
        settings,
        req.user.id
      );

      res.json(
        successResponse(
          {
            trackingId: tracking.trackingId,
            settings: tracking.settings,
          },
          "Tracking settings updated successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tracking by operator
   */
  async getTrackingByOperator(req, res, next) {
    try {
      const { operatorId } = req.params;

      const trackingSessions = await trackingService.getTrackingByOperator(
        operatorId,
        req.query
      );

      res.json(
        successResponse(
          {
            trackingSessions,
            count: trackingSessions.length,
          },
          "Operator tracking sessions retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my tracking sessions (for operators)
   */
  async getMyTrackingSessions(req, res, next) {
    try {
      if (req.user.role !== "bus_operator") {
        throw new ApiError("Only bus operators can access this endpoint", 403);
      }

      const trackingSessions = await trackingService.getTrackingByOperator(
        req.user.id,
        req.query
      );

      res.json(
        successResponse(
          {
            trackingSessions,
            count: trackingSessions.length,
          },
          "My tracking sessions retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up old tracking data (Admin only)
   */
  async cleanupOldTrackingData(req, res, next) {
    try {
      const { days = 30 } = req.body;

      const result = await trackingService.cleanupOldTrackingData(
        parseInt(days)
      );

      res.json(successResponse(result, "Old tracking data cleanup completed"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process offline buses (System/Admin only)
   */
  async processOfflineBuses(req, res, next) {
    try {
      const result = await trackingService.processOfflineBuses();

      res.json(successResponse(result, "Offline buses processed successfully"));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrackingController();
