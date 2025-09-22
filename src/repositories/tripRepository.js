// src/repositories/tripRepository.js
const Trip = require("../models/Trip");
const { ApiError } = require("../utils/errors");

class TripRepository {
  /**
   * Create a new trip
   */
  async create(tripData) {
    try {
      const trip = new Trip(tripData);
      await trip.save();
      return await this.findById(trip._id); // Return populated trip
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`Trip with this ${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Find trip by ID
   */
  async findById(id, populate = true) {
    try {
      let query = Trip.findById(id);

      if (populate) {
        query = query.populate([
          {
            path: "route",
            select:
              "routeNumber routeName origin destination waypoints distance estimatedDuration",
          },
          {
            path: "bus",
            select:
              "registrationNumber vehicleDetails capacity amenities operationalDetails.operator",
          },
          {
            path: "operator",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName email",
          },
          {
            path: "createdBy",
            select: "profile.firstName profile.lastName email",
          },
          {
            path: "lastModifiedBy",
            select: "profile.firstName profile.lastName email",
          },
        ]);
      }

      const trip = await query.exec();
      return trip;
    } catch (error) {
      throw new ApiError("Invalid trip ID format", 400);
    }
  }

  /**
   * Find trip by trip number
   */
  async findByTripNumber(tripNumber, populate = true) {
    let query = Trip.findOne({ tripNumber: tripNumber.toUpperCase() });

    if (populate) {
      query = query.populate([
        {
          path: "route",
          select: "routeNumber routeName origin destination waypoints",
        },
        {
          path: "bus",
          select: "registrationNumber vehicleDetails capacity amenities",
        },
        {
          path: "operator",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName",
        },
      ]);
    }

    return await query.exec();
  }

  /**
   * Update trip by ID
   */
  async updateById(id, updateData) {
    try {
      const trip = await Trip.findByIdAndUpdate(
        id,
        {
          $set: updateData,
          lastModifiedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      ).populate([
        {
          path: "route",
          select: "routeNumber routeName origin destination",
        },
        {
          path: "bus",
          select: "registrationNumber vehicleDetails capacity",
        },
        {
          path: "operator",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName",
        },
      ]);
      return trip;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`Trip with this ${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Delete trip by ID
   */
  async deleteById(id) {
    try {
      const trip = await Trip.findByIdAndDelete(id);
      return trip;
    } catch (error) {
      throw new ApiError("Invalid trip ID format", 400);
    }
  }

  /**
   * Get trips with pagination and filters
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "schedule.scheduledDeparture",
      sortOrder = "asc",
      search,
      status,
      route,
      bus,
      operator,
      dateFrom,
      dateTo,
      tripNumber,
      tripType,
      priority,
      delayed,
      active,
      completed,
    } = options;

    // Build query
    const query = { ...filters };

    if (status) query.status = status;
    if (route) query.route = route;
    if (bus) query.bus = bus;
    if (operator) query.operator = operator;
    if (tripNumber) query.tripNumber = new RegExp(tripNumber, "i");
    if (tripType) query["metadata.tripType"] = tripType;
    if (priority) query["metadata.priority"] = priority;

    // Date range filter
    if (dateFrom || dateTo) {
      query["schedule.scheduledDeparture"] = {};
      if (dateFrom) query["schedule.scheduledDeparture"].$gte = dateFrom;
      if (dateTo) query["schedule.scheduledDeparture"].$lte = dateTo;
    }

    // Status-based filters
    if (delayed) {
      const now = new Date();
      query.$or = [
        {
          status: { $in: ["scheduled", "boarding"] },
          "schedule.scheduledDeparture": {
            $lt: new Date(now.getTime() - 15 * 60 * 1000),
          },
        },
        {
          status: "delayed",
        },
      ];
    }

    if (active) {
      query.status = { $in: ["boarding", "departed", "in_transit"] };
    }

    if (completed) {
      query.status = { $in: ["arrived", "completed"] };
    }

    // General search
    if (search) {
      query.$or = [
        { tripNumber: { $regex: search, $options: "i" } },
        { "crew.driver.name": { $regex: search, $options: "i" } },
        { "crew.conductor.name": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate([
          {
            path: "route",
            select:
              "routeNumber routeName origin.city destination.city routeType",
          },
          {
            path: "bus",
            select:
              "registrationNumber vehicleDetails.make vehicleDetails.model capacity.totalSeats",
          },
          {
            path: "operator",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName",
          },
        ])
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Trip.countDocuments(query),
    ]);

    return {
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find active trips
   */
  async findActiveTrips() {
    return await Trip.findActiveTrips();
  }

  /**
   * Find trips by operator
   */
  async findByOperator(
    operatorId,
    status = null,
    dateFrom = null,
    dateTo = null
  ) {
    const query = { operator: operatorId };
    if (status) query.status = status;

    if (dateFrom || dateTo) {
      query["schedule.scheduledDeparture"] = {};
      if (dateFrom) query["schedule.scheduledDeparture"].$gte = dateFrom;
      if (dateTo) query["schedule.scheduledDeparture"].$lte = dateTo;
    }

    return await Trip.find(query)
      .populate([
        {
          path: "route",
          select: "routeNumber routeName origin.city destination.city",
        },
        {
          path: "bus",
          select: "registrationNumber vehicleDetails.make vehicleDetails.model",
        },
      ])
      .sort({ "schedule.scheduledDeparture": -1 });
  }

  /**
   * Find trips by route
   */
  async findByRoute(routeId, dateFrom = null, dateTo = null) {
    return await Trip.findByRoute(routeId, dateFrom, dateTo);
  }

  /**
   * Find trips by bus
   */
  async findByBus(busId, dateFrom = null, dateTo = null) {
    const query = { bus: busId };

    if (dateFrom || dateTo) {
      query["schedule.scheduledDeparture"] = {};
      if (dateFrom) query["schedule.scheduledDeparture"].$gte = dateFrom;
      if (dateTo) query["schedule.scheduledDeparture"].$lte = dateTo;
    }

    return await Trip.find(query)
      .populate([
        {
          path: "route",
          select: "routeNumber routeName origin.city destination.city",
        },
        {
          path: "operator",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName",
        },
      ])
      .sort({ "schedule.scheduledDeparture": -1 });
  }

  /**
   * Find delayed trips
   */
  async findDelayedTrips(thresholdMinutes = 15) {
    return await Trip.findDelayedTrips(thresholdMinutes).populate([
      {
        path: "route",
        select: "routeNumber routeName origin.city destination.city",
      },
      {
        path: "bus",
        select: "registrationNumber vehicleDetails.make vehicleDetails.model",
      },
      {
        path: "operator",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
    ]);
  }

  /**
   * Advanced trip search
   */
  async advancedSearch(searchParams) {
    const {
      origin,
      destination,
      travelDate,
      departureTimeFrom,
      departureTimeTo,
      tripType,
      maxFare,
      amenities,
      availableSeats,
      page = 1,
      limit = 10,
    } = searchParams;

    const query = {
      status: { $in: ["scheduled", "boarding"] },
    };

    // Date filter
    if (travelDate) {
      const startOfDay = new Date(travelDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(travelDate);
      endOfDay.setHours(23, 59, 59, 999);

      query["schedule.scheduledDeparture"] = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Time range filter
    if (departureTimeFrom || departureTimeTo) {
      const timeQuery = {};
      if (departureTimeFrom) {
        const [hours, minutes] = departureTimeFrom.split(":").map(Number);
        const timeInMinutes = hours * 60 + minutes;
        timeQuery.$gte = timeInMinutes;
      }
      if (departureTimeTo) {
        const [hours, minutes] = departureTimeTo.split(":").map(Number);
        const timeInMinutes = hours * 60 + minutes;
        timeQuery.$lte = timeInMinutes;
      }

      // This would need a more complex aggregation to extract time from scheduledDeparture
      // For now, we'll skip this filter
    }

    // Trip type filter
    if (tripType) query["metadata.tripType"] = tripType;

    // Fare filter
    if (maxFare) query["fare.baseFare"] = { $lte: maxFare };

    // Available seats filter
    if (availableSeats)
      query["capacity.availableSeats"] = { $gte: availableSeats };

    const skip = (page - 1) * limit;

    // Create aggregation pipeline for complex search
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "routes",
          localField: "route",
          foreignField: "_id",
          as: "routeInfo",
        },
      },
      {
        $lookup: {
          from: "buses",
          localField: "bus",
          foreignField: "_id",
          as: "busInfo",
        },
      },
      { $unwind: "$routeInfo" },
      { $unwind: "$busInfo" },
    ];

    // Origin/destination filters
    if (origin) {
      if (typeof origin === "string") {
        pipeline.push({
          $match: {
            "routeInfo.origin.city": { $regex: origin, $options: "i" },
          },
        });
      }
    }

    if (destination) {
      if (typeof destination === "string") {
        pipeline.push({
          $match: {
            "routeInfo.destination.city": {
              $regex: destination,
              $options: "i",
            },
          },
        });
      }
    }

    // Amenities filter
    if (amenities && amenities.length > 0) {
      const amenityMatch = {};
      amenities.forEach((amenity) => {
        amenityMatch[`busInfo.amenities.${amenity}`] = true;
      });
      pipeline.push({ $match: amenityMatch });
    }

    // Add pagination
    pipeline.push(
      { $sort: { "schedule.scheduledDeparture": 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    const [trips, totalCount] = await Promise.all([
      Trip.aggregate(pipeline),
      Trip.aggregate([...pipeline.slice(0, -2), { $count: "total" }]),
    ]);

    const total = totalCount[0]?.total || 0;

    return {
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get trip statistics
   */
  async getTripStats(operatorId = null, dateFrom = null, dateTo = null) {
    const matchCondition = {};

    if (operatorId) matchCondition.operator = operatorId;
    if (dateFrom || dateTo) {
      matchCondition["schedule.scheduledDeparture"] = {};
      if (dateFrom)
        matchCondition["schedule.scheduledDeparture"].$gte = dateFrom;
      if (dateTo) matchCondition["schedule.scheduledDeparture"].$lte = dateTo;
    }

    const stats = await Trip.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            status: "$status",
            tripType: "$metadata.tripType",
          },
          count: { $sum: 1 },
          avgOccupancy: {
            $avg: {
              $multiply: [
                { $divide: ["$capacity.bookedSeats", "$capacity.totalSeats"] },
                100,
              ],
            },
          },
          totalRevenue: { $sum: "$revenue.totalRevenue" },
          avgDelay: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$schedule.actualDeparture", null] },
                    { $ne: ["$schedule.scheduledDeparture", null] },
                  ],
                },
                {
                  $divide: [
                    {
                      $subtract: [
                        "$schedule.actualDeparture",
                        "$schedule.scheduledDeparture",
                      ],
                    },
                    60000, // Convert to minutes
                  ],
                },
                0,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.status",
          tripTypes: {
            $push: {
              type: "$_id.tripType",
              count: "$count",
              avgOccupancy: { $round: ["$avgOccupancy", 1] },
              totalRevenue: "$totalRevenue",
              avgDelay: { $round: ["$avgDelay", 1] },
            },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $project: {
          status: "$_id",
          tripTypes: 1,
          total: 1,
          _id: 0,
        },
      },
    ]);

    return stats;
  }

  /**
   * Get recently created trips
   */
  async getRecentTrips(days = 7, limit = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await Trip.find({
      createdAt: { $gte: dateThreshold },
    })
      .populate([
        {
          path: "route",
          select: "routeNumber routeName origin.city destination.city",
        },
        {
          path: "bus",
          select: "registrationNumber vehicleDetails.make vehicleDetails.model",
        },
        {
          path: "operator",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName",
        },
        {
          path: "createdBy",
          select: "profile.firstName profile.lastName",
        },
      ])
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Bulk update trips
   */
  async bulkUpdate(filter, updateData) {
    return await Trip.updateMany(filter, {
      $set: { ...updateData, lastModifiedAt: new Date() },
    });
  }

  /**
   * Check if trip number exists
   */
  async tripNumberExists(tripNumber) {
    const trip = await Trip.findOne({ tripNumber: tripNumber.toUpperCase() });
    return !!trip;
  }

  /**
   * Update trip location
   */
  async updateLocation(tripId, locationData) {
    return await Trip.findByIdAndUpdate(
      tripId,
      {
        $set: {
          "tracking.currentLocation": {
            coordinates: locationData.coordinates,
            address: locationData.address,
            lastUpdated: new Date(),
          },
          "tracking.speed": locationData.speed,
          "tracking.heading": locationData.heading,
          "tracking.distanceFromOrigin": locationData.distanceFromOrigin,
          "tracking.distanceToDestination": locationData.distanceToDestination,
        },
      },
      { new: true }
    );
  }

  /**
   * Add incident to trip
   */
  async addIncident(tripId, incidentData) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new ApiError("Trip not found", 404);

    return await trip.addIncident(incidentData);
  }

  /**
   * Update waypoint status
   */
  async updateWaypoint(tripId, waypointRef, updateData) {
    return await Trip.findOneAndUpdate(
      {
        _id: tripId,
        "waypoints.waypointRef": waypointRef,
      },
      {
        $set: Object.keys(updateData).reduce((acc, key) => {
          acc[`waypoints.$.${key}`] = updateData[key];
          return acc;
        }, {}),
      },
      { new: true }
    );
  }

  /**
   * Add passenger activity
   */
  async addPassengerActivity(tripId, waypointRef, activityData) {
    return await Trip.findOneAndUpdate(
      {
        _id: tripId,
        "waypoints.waypointRef": waypointRef,
      },
      {
        $inc: {
          "waypoints.$.passengerActivity.boarded": activityData.boarded || 0,
          "waypoints.$.passengerActivity.alighted": activityData.alighted || 0,
        },
      },
      { new: true }
    );
  }

  /**
   * Add rating to trip
   */
  async addRating(tripId, userId, ratingData) {
    return await Trip.findByIdAndUpdate(
      tripId,
      {
        $push: {
          "ratings.reviews": {
            user: userId,
            rating: ratingData.overall,
            comment: ratingData.comment,
            timestamp: new Date(),
          },
        },
        $inc: { "ratings.totalRatings": 1 },
      },
      { new: true }
    );
  }

  /**
   * Get trips by location (within radius)
   */
  async findByLocation(coordinates, radiusKm = 50, status = null) {
    const query = {
      "tracking.currentLocation.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude],
          },
          $maxDistance: radiusKm * 1000, // Convert to meters
        },
      },
    };

    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    } else {
      query.status = { $in: ["boarding", "departed", "in_transit"] }; // Active trips only
    }

    return await Trip.find(query).populate([
      {
        path: "route",
        select: "routeNumber routeName origin.city destination.city",
      },
      {
        path: "bus",
        select: "registrationNumber vehicleDetails.make vehicleDetails.model",
      },
      {
        path: "operator",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
    ]);
  }

  /**
   * Update trip revenue
   */
  async updateRevenue(tripId, revenueData) {
    return await Trip.findByIdAndUpdate(
      tripId,
      {
        $set: {
          "revenue.totalRevenue": revenueData.totalRevenue,
          "revenue.ticketsSold": revenueData.ticketsSold,
          "revenue.expenses": revenueData.expenses,
          "revenue.averageFare":
            revenueData.totalRevenue / (revenueData.ticketsSold || 1),
        },
      },
      { new: true }
    );
  }

  /**
   * Find trips for analytics
   */
  async findForAnalytics(filters = {}) {
    const { operator, route, dateFrom, dateTo, groupBy = "day" } = filters;

    const matchCondition = {};
    if (operator) matchCondition.operator = operator;
    if (route) matchCondition.route = route;
    if (dateFrom || dateTo) {
      matchCondition["schedule.scheduledDeparture"] = {};
      if (dateFrom)
        matchCondition["schedule.scheduledDeparture"].$gte = dateFrom;
      if (dateTo) matchCondition["schedule.scheduledDeparture"].$lte = dateTo;
    }

    let groupByFormat;
    switch (groupBy) {
      case "week":
        groupByFormat = { $week: "$schedule.scheduledDeparture" };
        break;
      case "month":
        groupByFormat = { $month: "$schedule.scheduledDeparture" };
        break;
      case "route":
        groupByFormat = "$route";
        break;
      case "operator":
        groupByFormat = "$operator";
        break;
      default: // day
        groupByFormat = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$schedule.scheduledDeparture",
          },
        };
    }

    return await Trip.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupByFormat,
          totalTrips: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledTrips: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          delayedTrips: {
            $sum: { $cond: [{ $eq: ["$status", "delayed"] }, 1, 0] },
          },
          totalRevenue: { $sum: "$revenue.totalRevenue" },
          totalPassengers: { $sum: "$capacity.bookedSeats" },
          avgOccupancy: {
            $avg: {
              $multiply: [
                { $divide: ["$capacity.bookedSeats", "$capacity.totalSeats"] },
                100,
              ],
            },
          },
          avgDelay: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$schedule.actualDeparture", null] },
                    { $ne: ["$schedule.scheduledDeparture", null] },
                  ],
                },
                {
                  $divide: [
                    {
                      $subtract: [
                        "$schedule.actualDeparture",
                        "$schedule.scheduledDeparture",
                      ],
                    },
                    60000,
                  ],
                },
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Generate schedule for recurring trips
   */
  async generateRecurringTrips(scheduleData) {
    const {
      route,
      bus,
      operator,
      startDate,
      endDate,
      departureTime,
      frequency,
      daysOfWeek,
      crew,
      fare,
    } = scheduleData;

    const trips = [];
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      let shouldCreateTrip = false;

      switch (frequency) {
        case "daily":
          shouldCreateTrip = true;
          break;
        case "weekdays":
          shouldCreateTrip =
            currentDate.getDay() >= 1 && currentDate.getDay() <= 5;
          break;
        case "weekends":
          shouldCreateTrip =
            currentDate.getDay() === 0 || currentDate.getDay() === 6;
          break;
        case "weekly":
          shouldCreateTrip =
            daysOfWeek && daysOfWeek.includes(currentDate.getDay());
          break;
      }

      if (shouldCreateTrip) {
        const [hours, minutes] = departureTime.split(":").map(Number);
        const scheduledDeparture = new Date(currentDate);
        scheduledDeparture.setHours(hours, minutes, 0, 0);

        // Estimate arrival time (would be calculated from route data)
        const scheduledArrival = new Date(
          scheduledDeparture.getTime() + 180 * 60000
        ); // 3 hours default

        const tripData = {
          route,
          bus,
          operator,
          schedule: {
            scheduledDeparture,
            scheduledArrival,
          },
          crew,
          capacity: {
            totalSeats: 50, // Would be taken from bus data
            bookedSeats: 0,
            availableSeats: 50,
            standingPassengers: 0,
          },
          fare,
          status: "scheduled",
          metadata: {
            tripType: "regular",
            repeatPattern: frequency,
          },
        };

        trips.push(tripData);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Bulk insert trips
    if (trips.length > 0) {
      const insertedTrips = await Trip.insertMany(trips);
      return insertedTrips;
    }

    return [];
  }

  /**
   * Find upcoming trips
   */
  async findUpcomingTrips(hours = 24, limit = 50) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return await Trip.find({
      status: { $in: ["scheduled", "boarding"] },
      "schedule.scheduledDeparture": {
        $gte: now,
        $lte: futureTime,
      },
    })
      .populate([
        {
          path: "route",
          select: "routeNumber routeName origin.city destination.city",
        },
        {
          path: "bus",
          select: "registrationNumber vehicleDetails.make vehicleDetails.model",
        },
        {
          path: "operator",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName",
        },
      ])
      .sort({ "schedule.scheduledDeparture": 1 })
      .limit(limit);
  }

  /**
   * Find trips with incidents
   */
  async findTripsWithIncidents(severity = null, resolved = null) {
    const query = {
      incidents: { $exists: true, $not: { $size: 0 } },
    };

    const pipeline = [{ $match: query }, { $unwind: "$incidents" }];

    if (severity) {
      pipeline.push({ $match: { "incidents.severity": severity } });
    }

    if (resolved !== null) {
      pipeline.push({ $match: { "incidents.resolved": resolved } });
    }

    pipeline.push(
      {
        $group: {
          _id: "$_id",
          tripNumber: { $first: "$tripNumber" },
          route: { $first: "$route" },
          bus: { $first: "$bus" },
          status: { $first: "$status" },
          incidents: { $push: "$incidents" },
        },
      },
      {
        $lookup: {
          from: "routes",
          localField: "route",
          foreignField: "_id",
          as: "routeInfo",
        },
      },
      {
        $lookup: {
          from: "buses",
          localField: "bus",
          foreignField: "_id",
          as: "busInfo",
        },
      }
    );

    return await Trip.aggregate(pipeline);
  }
}

module.exports = new TripRepository();
