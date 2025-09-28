// src/repositories/trackingRepository.js
const Tracking = require("../models/Tracking");
const { ApiError } = require("../utils/errors");

class TrackingRepository {
  /**
   * Create a new tracking session
   */
  async create(trackingData) {
    try {
      const tracking = new Tracking(trackingData);
      await tracking.save();
      return await this.findById(tracking._id); // Return populated tracking
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(
          `Tracking session with this ${field} already exists`,
          409
        );
      }
      throw error;
    }
  }

  /**
   * Find tracking by ID
   */
  async findById(id, populate = true) {
    try {
      let query = Tracking.findById(id);

      if (populate) {
        query = query.populate([
          {
            path: "trip",
            select: "tripNumber schedule status",
            populate: {
              path: "route",
              select: "routeNumber routeName origin destination",
            },
          },
          {
            path: "bus",
            select:
              "registrationNumber vehicleDetails.make vehicleDetails.model capacity",
          },
          {
            path: "route",
            select:
              "routeNumber routeName origin destination distance waypoints",
          },
          {
            path: "createdBy",
            select: "profile.firstName profile.lastName email",
          },
        ]);
      }

      const tracking = await query.exec();
      return tracking;
    } catch (error) {
      throw new ApiError("Invalid tracking ID format", 400);
    }
  }

  /**
   * Find tracking by trip ID
   */
  async findByTrip(tripId, populate = true) {
    let query = Tracking.findOne({
      trip: tripId,
      status: { $ne: "completed" },
    });

    if (populate) {
      query = query.populate([
        {
          path: "bus",
          select: "registrationNumber vehicleDetails.make vehicleDetails.model",
        },
        {
          path: "route",
          select: "routeNumber routeName origin destination",
        },
      ]);
    }

    return await query.exec();
  }

  /**
   * Find tracking by bus ID
   */
  async findByBus(busId) {
    return await Tracking.findOne({
      bus: busId,
      status: { $in: ["active", "paused", "emergency"] },
    })
      .populate("trip route")
      .exec();
  }

  /**
   * Update tracking by ID
   */
  async updateById(id, updateData) {
    try {
      const tracking = await Tracking.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      ).populate([
        {
          path: "trip",
          select: "tripNumber status",
        },
        {
          path: "bus",
          select: "registrationNumber",
        },
      ]);
      return tracking;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(
          `Tracking session with this ${field} already exists`,
          409
        );
      }
      throw error;
    }
  }

  /**
   * Delete tracking by ID
   */
  async deleteById(id) {
    try {
      const tracking = await Tracking.findByIdAndDelete(id);
      return tracking;
    } catch (error) {
      throw new ApiError("Invalid tracking ID format", 400);
    }
  }

  /**
   * Get tracking sessions with pagination and filters
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "realTimeData.timestamp",
      sortOrder = "desc",
      search,
      status,
      busId,
      routeId,
      tripId,
      driverId,
      dateFrom,
      dateTo,
      isOnline,
      inEmergency,
      nearLocation,
      radiusKm,
    } = options;

    // Build query
    const query = { ...filters };

    if (status) query.status = status;
    if (busId) query.bus = busId;
    if (routeId) query.route = routeId;
    if (tripId) query.trip = tripId;
    if (driverId) query["driver.driverId"] = driverId;

    // Date range filter
    if (dateFrom || dateTo) {
      query["metadata.startTime"] = {};
      if (dateFrom) query["metadata.startTime"].$gte = dateFrom;
      if (dateTo) query["metadata.startTime"].$lte = dateTo;
    }

    // Online status filter
    if (isOnline !== undefined) {
      if (isOnline) {
        query["connectivity.lastHeartbeat"] = {
          $gte: new Date(Date.now() - 5 * 60 * 1000), // last 5 minutes
        };
      } else {
        query["connectivity.lastHeartbeat"] = {
          $lt: new Date(Date.now() - 5 * 60 * 1000),
        };
      }
    }

    // Emergency filter
    if (inEmergency !== undefined) {
      if (inEmergency) {
        query.$or = [
          { status: "emergency" },
          { "emergencyData.panicButtonPressed": true },
          { "emergencyData.currentEmergency.status": "active" },
        ];
      } else {
        query.status = { $ne: "emergency" };
        query["emergencyData.panicButtonPressed"] = { $ne: true };
        query["emergencyData.currentEmergency.status"] = { $ne: "active" };
      }
    }

    // Location-based filter
    if (
      nearLocation &&
      Array.isArray(nearLocation) &&
      nearLocation.length === 2
    ) {
      const maxDistance = (radiusKm || 50) * 1000; // convert to meters
      query["realTimeData.currentLocation"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: nearLocation, // [longitude, latitude]
          },
          $maxDistance: maxDistance,
        },
      };
    }

    // General search
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: "i" } },
        { "driver.name": { $regex: search, $options: "i" } },
        { "realTimeData.address": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [trackingSessions, total] = await Promise.all([
      Tracking.find(query)
        .populate([
          {
            path: "trip",
            select: "tripNumber status schedule",
          },
          {
            path: "bus",
            select:
              "registrationNumber vehicleDetails.make vehicleDetails.model",
          },
          {
            path: "route",
            select: "routeNumber routeName origin.city destination.city",
          },
        ])
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Tracking.countDocuments(query),
    ]);

    return {
      trackingSessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find active tracking sessions
   */
  async findActive() {
    return await Tracking.findActive();
  }

  /**
   * Find tracking sessions by location
   */
  async findByLocation(coordinates, radiusKm = 50) {
    return await Tracking.findByLocation(coordinates, radiusKm);
  }

  /**
   * Find offline buses
   */
  async findOffline(minutesThreshold = 10) {
    return await Tracking.findOffline(minutesThreshold);
  }

  /**
   * Find emergency situations
   */
  async findEmergencies() {
    return await Tracking.findEmergencies();
  }

  /**
   * Update location for tracking session
   */
  async updateLocation(trackingId, locationData) {
    const tracking = await Tracking.findById(trackingId);
    if (!tracking) throw new ApiError("Tracking session not found", 404);

    return await tracking.updateLocation(locationData);
  }

  /**
   * Add alert to tracking session
   */
  async addAlert(trackingId, alertData) {
    const tracking = await Tracking.findById(trackingId);
    if (!tracking) throw new ApiError("Tracking session not found", 404);

    return await tracking.addAlert(alertData);
  }

  /**
   * Trigger emergency for tracking session
   */
  async triggerEmergency(trackingId, emergencyData) {
    const tracking = await Tracking.findById(trackingId);
    if (!tracking) throw new ApiError("Tracking session not found", 404);

    return await tracking.triggerEmergency(emergencyData);
  }

  /**
   * Get tracking analytics
   */
  async getTrackingStats(dateFrom = null, dateTo = null) {
    const matchCondition = {};

    if (dateFrom || dateTo) {
      matchCondition["metadata.startTime"] = {};
      if (dateFrom) matchCondition["metadata.startTime"].$gte = dateFrom;
      if (dateTo) matchCondition["metadata.startTime"].$lte = dateTo;
    }

    const stats = await Tracking.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            status: "$status",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$metadata.startTime",
              },
            },
          },
          count: { $sum: 1 },
          avgSpeed: { $avg: "$performance.averageSpeed" },
          totalDistance: { $sum: "$performance.totalDistance" },
          totalAlerts: { $sum: { $size: "$alerts" } },
          emergencyCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "emergency"] }, 1, 0],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
              avgSpeed: "$avgSpeed",
              totalDistance: "$totalDistance",
              totalAlerts: "$totalAlerts",
              emergencyCount: "$emergencyCount",
            },
          },
          totalSessions: { $sum: "$count" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    return stats;
  }

  /**
   * Get real-time tracking data for dashboard
   */
  async getDashboardData() {
    const [activeSessions, emergencies, offlineBuses, recentAlerts] =
      await Promise.all([
        this.findActive(),
        this.findEmergencies(),
        this.findOffline(10),
        Tracking.aggregate([
          { $unwind: "$alerts" },
          {
            $match: {
              "alerts.timestamp": {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          },
          { $sort: { "alerts.timestamp": -1 } },
          { $limit: 50 },
          {
            $lookup: {
              from: "buses",
              localField: "bus",
              foreignField: "_id",
              as: "busInfo",
            },
          },
          {
            $project: {
              alert: "$alerts",
              bus: { $arrayElemAt: ["$busInfo.registrationNumber", 0] },
              trip: "$trip",
            },
          },
        ]),
      ]);

    return {
      summary: {
        totalActiveSessions: activeSessions.length,
        totalEmergencies: emergencies.length,
        totalOffline: offlineBuses.length,
        totalAlerts: recentAlerts.length,
      },
      activeSessions,
      emergencies,
      offlineBuses,
      recentAlerts,
    };
  }

  /**
   * Get location history for a tracking session
   */
  async getLocationHistory(trackingId, hoursBack = 24) {
    const tracking = await Tracking.findById(trackingId);
    if (!tracking) throw new ApiError("Tracking session not found", 404);

    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    // Filter history points within time range
    const filteredHistory = tracking.trackingHistory.filter(
      (point) => point.timestamp >= cutoffTime
    );

    return {
      trackingId: tracking.trackingId,
      currentLocation: tracking.realTimeData.currentLocation,
      history: filteredHistory,
      totalPoints: filteredHistory.length,
      timeRange: `${hoursBack} hours`,
    };
  }

  /**
   * Get performance metrics for tracking session
   */
  async getPerformanceMetrics(trackingId) {
    const tracking = await Tracking.findById(trackingId).populate(
      "trip route bus"
    );

    if (!tracking) throw new ApiError("Tracking session not found", 404);

    const metrics = {
      tracking: {
        id: tracking.trackingId,
        status: tracking.status,
        duration: tracking.currentDuration,
        dataPoints: tracking.metadata.dataPoints,
      },
      performance: tracking.performance,
      connectivity: tracking.connectivity,
      route: tracking.route
        ? {
            routeNumber: tracking.route.routeNumber,
            distance: tracking.route.distance,
            completion: tracking.routeProgress.completionPercentage,
          }
        : null,
      alerts: {
        total: tracking.alerts.length,
        unacknowledged: tracking.alerts.filter((a) => !a.acknowledged).length,
        byType: tracking.alerts.reduce((acc, alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1;
          return acc;
        }, {}),
      },
    };

    return metrics;
  }

  /**
   * Bulk update tracking sessions
   */
  async bulkUpdate(filter, updateData) {
    return await Tracking.updateMany(filter, {
      $set: updateData,
    });
  }

  /**
   * Complete tracking session
   */
  async completeSession(trackingId) {
    const tracking = await Tracking.findById(trackingId);
    if (!tracking) throw new ApiError("Tracking session not found", 404);

    const endTime = new Date();
    const totalDuration = Math.round(
      (endTime - tracking.metadata.startTime) / (1000 * 60)
    ); // minutes

    const updatedTracking = await this.updateById(trackingId, {
      status: "completed",
      "metadata.endTime": endTime,
      "metadata.totalDuration": totalDuration,
    });

    return updatedTracking;
  }

  /**
   * Get tracking sessions by bus operator
   */
  async findByOperator(operatorId, status = null) {
    const query = {};
    if (status) query.status = status;

    return await Tracking.find(query)
      .populate({
        path: "bus",
        match: { "operationalDetails.operator": operatorId },
        select: "registrationNumber vehicleDetails",
      })
      .populate("trip route")
      .exec();
  }

  /**
   * Find tracking sessions with recent activity
   */
  async findRecentActivity(hours = 24, limit = 50) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await Tracking.find({
      "realTimeData.timestamp": { $gte: cutoffTime },
    })
      .populate("trip route bus")
      .sort({ "realTimeData.timestamp": -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Update heartbeat for tracking session
   */
  async updateHeartbeat(trackingId, deviceInfo = {}) {
    return await this.updateById(trackingId, {
      "connectivity.lastHeartbeat": new Date(),
      "connectivity.isOnline": true,
      "connectivity.lastOnlineAt": new Date(),
      ...(deviceInfo.signalStrength && {
        "connectivity.signalStrength": deviceInfo.signalStrength,
      }),
      ...(deviceInfo.batteryLevel && {
        "connectivity.deviceInfo.batteryLevel": deviceInfo.batteryLevel,
      }),
      ...(deviceInfo.connectionType && {
        "connectivity.connectionType": deviceInfo.connectionType,
      }),
    });
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(trackingId, alertId, acknowledgedBy) {
    const tracking = await Tracking.findById(trackingId);
    if (!tracking) throw new ApiError("Tracking session not found", 404);

    const alert = tracking.alerts.find((a) => a.alertId === alertId);
    if (!alert) throw new ApiError("Alert not found", 404);

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    return await tracking.save();
  }

  /**
   * Resolve alert
   */
  async resolveAlert(trackingId, alertId) {
    const tracking = await Tracking.findById(trackingId);
    if (!tracking) throw new ApiError("Tracking session not found", 404);

    const alert = tracking.alerts.find((a) => a.alertId === alertId);
    if (!alert) throw new ApiError("Alert not found", 404);

    alert.resolved = true;
    alert.resolvedAt = new Date();

    return await tracking.save();
  }
}

module.exports = new TrackingRepository();
