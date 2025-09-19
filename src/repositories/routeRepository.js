// src/repositories/routeRepository.js
const Route = require("../models/Route");
const { ApiError } = require("../utils/errors");

class RouteRepository {
  /**
   * Create a new route
   */
  async create(routeData) {
    try {
      const route = new Route(routeData);
      await route.save();
      return await this.findById(route._id); // Return populated route
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`Route with this ${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Find route by ID
   */
  async findById(id, populate = true) {
    try {
      let query = Route.findById(id);

      if (populate) {
        query = query.populate([
          {
            path: "operatedBy",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName email role status",
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

      const route = await query.exec();
      return route;
    } catch (error) {
      throw new ApiError("Invalid route ID format", 400);
    }
  }

  /**
   * Find route by route number
   */
  async findByRouteNumber(routeNumber, populate = true) {
    let query = Route.findOne({ routeNumber: routeNumber.toUpperCase() });

    if (populate) {
      query = query.populate([
        {
          path: "operatedBy",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName email",
        },
      ]);
    }

    return await query.exec();
  }

  /**
   * Update route by ID
   */
  async updateById(id, updateData) {
    try {
      const route = await Route.findByIdAndUpdate(
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
          path: "operatedBy",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName email",
        },
      ]);
      return route;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`Route with this ${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Delete route by ID
   */
  async deleteById(id) {
    try {
      const route = await Route.findByIdAndDelete(id);
      return route;
    } catch (error) {
      throw new ApiError("Invalid route ID format", 400);
    }
  }

  /**
   * Get routes with pagination and filters
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      routeType,
      status,
      province,
      originCity,
      destinationCity,
      routeNumber,
      operatedBy,
      interProvincialOnly,
      amenities,
    } = options;

    // Build query
    const query = { ...filters };

    if (routeType) query.routeType = routeType;
    if (status) query.status = status;
    if (routeNumber) query.routeNumber = new RegExp(routeNumber, "i");
    if (operatedBy) query.operatedBy = operatedBy;

    // Province filter
    if (province) {
      query.$or = [
        { "origin.province": province },
        { "destination.province": province },
      ];
    }

    // City filters
    if (originCity) query["origin.city"] = new RegExp(originCity, "i");
    if (destinationCity)
      query["destination.city"] = new RegExp(destinationCity, "i");

    // Inter-provincial filter
    if (interProvincialOnly) {
      query.$expr = { $ne: ["$origin.province", "$destination.province"] };
    }

    // General search
    if (search) {
      query.$or = [
        { routeNumber: { $regex: search, $options: "i" } },
        { routeName: { $regex: search, $options: "i" } },
        { "origin.city": { $regex: search, $options: "i" } },
        { "destination.city": { $regex: search, $options: "i" } },
        { "waypoints.name": { $regex: search, $options: "i" } },
      ];
    }

    // Amenities filter
    if (amenities && amenities.length > 0) {
      const amenityQuery = {};
      amenities.forEach((amenity) => {
        amenityQuery[`amenities.${amenity}`] = true;
      });
      query.$and = query.$and || [];
      query.$and.push(amenityQuery);
    }

    // Build sort object
    const sort = {};
    if (sortBy.includes(".")) {
      // Handle nested fields like 'fare.baseFare'
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [routes, total] = await Promise.all([
      Route.find(query)
        .populate([
          {
            path: "operatedBy",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName email",
          },
        ])
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Route.countDocuments(query),
    ]);

    return {
      routes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRoutes: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find routes between cities
   */
  async findRoutesBetweenCities(
    originCity,
    destinationCity,
    status = "active"
  ) {
    return await Route.findRoutesBetweenCities(
      originCity,
      destinationCity,
      status
    );
  }

  /**
   * Find routes by province
   */
  async findRoutesByProvince(province, status = "active") {
    return await Route.findRoutesByProvince(province, status);
  }

  /**
   * Find inter-provincial routes
   */
  async findInterProvincialRoutes(status = "active") {
    return await Route.findInterProvincialRoutes(status).populate([
      {
        path: "operatedBy",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
    ]);
  }

  /**
   * Find routes operated by specific user
   */
  async findByOperator(operatorId, status = null) {
    const query = { operatedBy: operatorId };
    if (status) query.status = status;

    return await Route.find(query)
      .populate([
        {
          path: "operatedBy",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName",
        },
      ])
      .sort({ createdAt: -1 });
  }

  /**
   * Advanced route search
   */
  async advancedSearch(searchParams) {
    const {
      origin,
      destination,
      travelDate,
      routeType,
      maxDistance,
      maxDuration,
      amenities,
      maxFare,
      page = 1,
      limit = 10,
    } = searchParams;

    const query = { status: "active" };

    // Origin search (city name or coordinates)
    if (origin) {
      if (typeof origin === "string") {
        query["origin.city"] = new RegExp(origin, "i");
      } else if (origin.latitude && origin.longitude) {
        // Geospatial search for nearby origins (within 50km)
        query["origin.coordinates"] = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [origin.longitude, origin.latitude],
            },
            $maxDistance: 50000, // 50km in meters
          },
        };
      }
    }

    // Destination search
    if (destination) {
      if (typeof destination === "string") {
        query["destination.city"] = new RegExp(destination, "i");
      } else if (destination.latitude && destination.longitude) {
        query["destination.coordinates"] = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [destination.longitude, destination.latitude],
            },
            $maxDistance: 50000,
          },
        };
      }
    }

    // Route type filter
    if (routeType) query.routeType = routeType;

    // Distance and duration filters
    if (maxDistance) query.distance = { $lte: maxDistance };
    if (maxDuration) query.estimatedDuration = { $lte: maxDuration };
    if (maxFare) query["fare.baseFare"] = { $lte: maxFare };

    // Amenities filter
    if (amenities && amenities.length > 0) {
      const amenityQuery = {};
      amenities.forEach((amenity) => {
        amenityQuery[`amenities.${amenity}`] = true;
      });
      query.$and = query.$and || [];
      query.$and.push(amenityQuery);
    }

    // Day of week filter based on travel date
    if (travelDate) {
      const dayOfWeek = new Date(travelDate).toLocaleLowerCase();
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayName = dayNames[new Date(travelDate).getDay()];
      query[`weeklySchedule.${dayName}`] = true;
    }

    const skip = (page - 1) * limit;

    const [routes, total] = await Promise.all([
      Route.find(query)
        .populate([
          {
            path: "operatedBy",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName",
          },
        ])
        .sort({ "fare.baseFare": 1, estimatedDuration: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Route.countDocuments(query),
    ]);

    return {
      routes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRoutes: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get route statistics
   */
  async getRouteStats() {
    const stats = await Route.aggregate([
      {
        $group: {
          _id: {
            routeType: "$routeType",
            status: "$status",
          },
          count: { $sum: 1 },
          avgDistance: { $avg: "$distance" },
          avgDuration: { $avg: "$estimatedDuration" },
          avgFare: { $avg: "$fare.baseFare" },
        },
      },
      {
        $group: {
          _id: "$_id.routeType",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
              avgDistance: { $round: ["$avgDistance", 2] },
              avgDuration: { $round: ["$avgDuration", 0] },
              avgFare: { $round: ["$avgFare", 2] },
            },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $project: {
          routeType: "$_id",
          statuses: 1,
          total: 1,
          _id: 0,
        },
      },
    ]);

    // Get province-wise route distribution
    const provinceStats = await Route.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: {
            originProvince: "$origin.province",
            destinationProvince: "$destination.province",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          route: {
            $concat: ["$_id.originProvince", " → ", "$_id.destinationProvince"],
          },
          count: 1,
          isInterProvincial: {
            $ne: ["$_id.originProvince", "$_id.destinationProvince"],
          },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return { routeTypeStats: stats, topRoutes: provinceStats };
  }

  /**
   * Get recently added routes
   */
  async getRecentRoutes(days = 7, limit = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await Route.find({
      createdAt: { $gte: dateThreshold },
    })
      .populate([
        {
          path: "operatedBy",
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
   * Bulk update routes
   */
  async bulkUpdate(filter, updateData) {
    return await Route.updateMany(filter, {
      $set: { ...updateData, lastModifiedAt: new Date() },
    });
  }

  /**
   * Check if route number exists
   */
  async routeNumberExists(routeNumber) {
    const route = await Route.findOne({
      routeNumber: routeNumber.toUpperCase(),
    });
    return !!route;
  }

  /**
   * Get routes with upcoming departures
   */
  async getRoutesWithUpcomingDepartures(currentTime = new Date()) {
    const routes = await Route.find({ status: "active" }).populate([
      {
        path: "operatedBy",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
    ]);

    // Filter routes that have departures remaining today
    const routesWithDepartures = routes.filter((route) => {
      const nextDeparture = route.getNextDeparture(currentTime);
      return nextDeparture !== null;
    });

    return routesWithDepartures.map((route) => ({
      ...route.toJSON(),
      nextDeparture: route.getNextDeparture(currentTime),
      totalJourneyTime: route.calculateTotalJourneyTime(),
    }));
  }

  /**
   * Find routes by coordinates (near location)
   */
  async findNearbyRoutes(coordinates, maxDistance = 50000) {
    return await Route.find({
      status: "active",
      $or: [
        {
          "origin.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [coordinates.longitude, coordinates.latitude],
              },
              $maxDistance: maxDistance,
            },
          },
        },
        {
          "destination.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [coordinates.longitude, coordinates.latitude],
              },
              $maxDistance: maxDistance,
            },
          },
        },
      ],
    }).populate([
      {
        path: "operatedBy",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
    ]);
  }

  /**
   * Update route statistics
   */
  async updateStatistics(routeId, statsUpdate) {
    return await Route.findByIdAndUpdate(
      routeId,
      {
        $inc: {
          "statistics.totalTrips": statsUpdate.totalTrips || 0,
          "statistics.totalBuses": statsUpdate.totalBuses || 0,
        },
        $set: {
          "statistics.averageRating": statsUpdate.averageRating,
          "statistics.lastActiveDate": new Date(),
        },
      },
      { new: true }
    );
  }
}

module.exports = new RouteRepository();
