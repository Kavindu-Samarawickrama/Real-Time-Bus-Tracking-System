// src/repositories/busRepository.js
const Bus = require("../models/Bus");
const { ApiError } = require("../utils/errors");

class BusRepository {
  /**
   * Create a new bus
   */
  async create(busData) {
    try {
      const bus = new Bus(busData);
      await bus.save();
      return await this.findById(bus._id); // Return populated bus
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`Bus with this ${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Find bus by ID
   */
  async findById(id, populate = true) {
    try {
      let query = Bus.findById(id);

      if (populate) {
        query = query.populate([
          {
            path: "operationalDetails.operator",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName email role status",
          },
          {
            path: "operationalDetails.assignedRoute",
            select:
              "routeNumber routeName origin.city destination.city routeType status",
          },
          {
            path: "createdBy",
            select: "profile.firstName profile.lastName email",
          },
          {
            path: "lastModifiedBy",
            select: "profile.firstName profile.lastName email",
          },
          {
            path: "approvedBy",
            select: "profile.firstName profile.lastName email",
          },
        ]);
      }

      const bus = await query.exec();
      return bus;
    } catch (error) {
      throw new ApiError("Invalid bus ID format", 400);
    }
  }

  /**
   * Find bus by registration number
   */
  async findByRegistrationNumber(registrationNumber, populate = true) {
    let query = Bus.findOne({
      registrationNumber: registrationNumber.toUpperCase(),
    });

    if (populate) {
      query = query.populate([
        {
          path: "operationalDetails.operator",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName email",
        },
        {
          path: "operationalDetails.assignedRoute",
          select: "routeNumber routeName origin.city destination.city",
        },
      ]);
    }

    return await query.exec();
  }

  /**
   * Update bus by ID
   */
  async updateById(id, updateData) {
    try {
      const bus = await Bus.findByIdAndUpdate(
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
          path: "operationalDetails.operator",
          select:
            "profile.firstName profile.lastName organizationDetails.companyName email",
        },
        {
          path: "operationalDetails.assignedRoute",
          select: "routeNumber routeName origin.city destination.city",
        },
      ]);
      return bus;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`Bus with this ${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Delete bus by ID
   */
  async deleteById(id) {
    try {
      const bus = await Bus.findByIdAndDelete(id);
      return bus;
    } catch (error) {
      throw new ApiError("Invalid bus ID format", 400);
    }
  }

  /**
   * Get buses with pagination and filters
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      status,
      operator,
      route,
      registrationNumber,
      make,
      model,
      minSeats,
      maxSeats,
      amenities,
      fuelType,
      transmissionType,
      needsService,
      expiring,
    } = options;

    // Build query
    const query = { ...filters };

    if (status) query.status = status;
    if (operator) query["operationalDetails.operator"] = operator;
    if (route) query["operationalDetails.assignedRoute"] = route;
    if (registrationNumber)
      query.registrationNumber = new RegExp(registrationNumber, "i");
    if (make) query["vehicleDetails.make"] = new RegExp(make, "i");
    if (model) query["vehicleDetails.model"] = new RegExp(model, "i");
    if (fuelType) query["vehicleDetails.fuelType"] = fuelType;
    if (transmissionType)
      query["vehicleDetails.transmissionType"] = transmissionType;

    // Capacity filters
    if (minSeats) query["capacity.totalSeats"] = { $gte: minSeats };
    if (maxSeats) {
      query["capacity.totalSeats"] = query["capacity.totalSeats"]
        ? { ...query["capacity.totalSeats"], $lte: maxSeats }
        : { $lte: maxSeats };
    }

    // Service filter
    if (needsService) {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      query.$or = [
        { "maintenance.nextServiceDue": { $lte: weekFromNow } },
        { "maintenance.nextServiceDue": { $exists: false } },
        { "maintenance.nextServiceDue": null },
      ];
    }

    // Expiring permits filter
    if (expiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      query.$or = [
        { "compliance.routePermitExpiry": { $lte: thirtyDaysFromNow } },
        { "compliance.revenuePermitExpiry": { $lte: thirtyDaysFromNow } },
        { "maintenance.fitnessExpiry": { $lte: thirtyDaysFromNow } },
        { "maintenance.insuranceExpiry": { $lte: thirtyDaysFromNow } },
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

    // General search
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: "i" } },
        { permitNumber: { $regex: search, $options: "i" } },
        { "vehicleDetails.make": { $regex: search, $options: "i" } },
        { "vehicleDetails.model": { $regex: search, $options: "i" } },
        {
          "operationalDetails.currentDriver.name": {
            $regex: search,
            $options: "i",
          },
        },
        { "location.depot.name": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [buses, total] = await Promise.all([
      Bus.find(query)
        .populate([
          {
            path: "operationalDetails.operator",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName email",
          },
          {
            path: "operationalDetails.assignedRoute",
            select: "routeNumber routeName origin.city destination.city",
          },
        ])
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Bus.countDocuments(query),
    ]);

    return {
      buses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBuses: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find buses by operator
   */
  async findByOperator(operatorId, status = null) {
    return await Bus.findByOperator(operatorId, status);
  }

  /**
   * Find buses by route
   */
  async findByRoute(routeId, status = "active") {
    return await Bus.findByRoute(routeId, status);
  }

  /**
   * Find buses needing service
   */
  async findNeedingService() {
    return await Bus.findNeedingService().populate([
      {
        path: "operationalDetails.operator",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
    ]);
  }

  /**
   * Find buses with expiring permits
   */
  async findWithExpiringPermits(days = 30) {
    return await Bus.findWithExpiringPermits(days).populate([
      {
        path: "operationalDetails.operator",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
    ]);
  }

  /**
   * Advanced bus search with geospatial queries
   */
  async advancedSearch(searchParams) {
    const {
      location,
      radius = 50,
      route,
      operator,
      amenities,
      minCapacity,
      maxCapacity,
      fuelType,
      status = "active",
      page = 1,
      limit = 10,
    } = searchParams;

    const query = { status };

    // Route and operator filters
    if (route) query["operationalDetails.assignedRoute"] = route;
    if (operator) query["operationalDetails.operator"] = operator;
    if (fuelType) query["vehicleDetails.fuelType"] = fuelType;

    // Capacity filters
    if (minCapacity) query["capacity.totalSeats"] = { $gte: minCapacity };
    if (maxCapacity) {
      query["capacity.totalSeats"] = query["capacity.totalSeats"]
        ? { ...query["capacity.totalSeats"], $lte: maxCapacity }
        : { $lte: maxCapacity };
    }

    // Location search (find buses near a location)
    if (location && location.latitude && location.longitude) {
      query["location.current.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      };
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

    const skip = (page - 1) * limit;

    const [buses, total] = await Promise.all([
      Bus.find(query)
        .populate([
          {
            path: "operationalDetails.operator",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName",
          },
          {
            path: "operationalDetails.assignedRoute",
            select: "routeNumber routeName origin.city destination.city",
          },
        ])
        .sort({ "statistics.totalTrips": -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Bus.countDocuments(query),
    ]);

    return {
      buses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBuses: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get fleet statistics
   */
  async getFleetStats(operatorId = null) {
    const matchCondition = operatorId
      ? { "operationalDetails.operator": operatorId }
      : {};

    const stats = await Bus.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            status: "$status",
            fuelType: "$vehicleDetails.fuelType",
          },
          count: { $sum: 1 },
          avgSeats: { $avg: "$capacity.totalSeats" },
          avgYear: { $avg: "$vehicleDetails.year" },
          totalMileage: { $sum: "$maintenance.currentMileage" },
        },
      },
      {
        $group: {
          _id: "$_id.status",
          fuelTypes: {
            $push: {
              type: "$_id.fuelType",
              count: "$count",
              avgSeats: { $round: ["$avgSeats", 0] },
              avgYear: { $round: ["$avgYear", 0] },
              totalMileage: "$totalMileage",
            },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $project: {
          status: "$_id",
          fuelTypes: 1,
          total: 1,
          _id: 0,
        },
      },
    ]);

    // Get maintenance statistics
    const maintenanceStats = await Bus.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          needingService: {
            $sum: {
              $cond: [
                {
                  $or: [
                    {
                      $lte: [
                        "$maintenance.nextServiceDue",
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      ],
                    },
                    { $eq: ["$maintenance.nextServiceDue", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          expiringPermits: {
            $sum: {
              $cond: [
                {
                  $or: [
                    {
                      $lte: [
                        "$compliance.routePermitExpiry",
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                      ],
                    },
                    {
                      $lte: [
                        "$compliance.revenuePermitExpiry",
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                      ],
                    },
                    {
                      $lte: [
                        "$maintenance.fitnessExpiry",
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                      ],
                    },
                    {
                      $lte: [
                        "$maintenance.insuranceExpiry",
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return {
      fleetStats: stats,
      maintenanceStats: maintenanceStats[0] || {
        needingService: 0,
        expiringPermits: 0,
      },
    };
  }

  /**
   * Get recently added buses
   */
  async getRecentBuses(days = 7, limit = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await Bus.find({
      createdAt: { $gte: dateThreshold },
    })
      .populate([
        {
          path: "operationalDetails.operator",
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
   * Bulk update buses
   */
  async bulkUpdate(filter, updateData) {
    return await Bus.updateMany(filter, {
      $set: { ...updateData, lastModifiedAt: new Date() },
    });
  }

  /**
   * Check if registration number exists
   */
  async registrationNumberExists(registrationNumber) {
    const bus = await Bus.findOne({
      registrationNumber: registrationNumber.toUpperCase(),
    });
    return !!bus;
  }

  /**
   * Check if permit number exists
   */
  async permitNumberExists(permitNumber) {
    const bus = await Bus.findOne({ permitNumber: permitNumber.toUpperCase() });
    return !!bus;
  }

  /**
   * Update bus location
   */
  async updateLocation(busId, locationData) {
    return await Bus.findByIdAndUpdate(
      busId,
      {
        $set: {
          "location.current": {
            ...locationData,
            lastUpdated: new Date(),
          },
        },
      },
      { new: true }
    );
  }

  /**
   * Add maintenance record
   */
  async addMaintenanceRecord(busId, record) {
    const bus = await Bus.findById(busId);
    if (!bus) throw new ApiError("Bus not found", 404);

    return await bus.addMaintenanceRecord(record);
  }

  /**
   * Assign route to bus
   */
  async assignRoute(busId, routeId) {
    return await Bus.findByIdAndUpdate(
      busId,
      {
        $set: {
          "operationalDetails.assignedRoute": routeId,
          lastModifiedAt: new Date(),
        },
      },
      { new: true }
    ).populate([
      {
        path: "operationalDetails.assignedRoute",
        select: "routeNumber routeName origin.city destination.city",
      },
    ]);
  }

  /**
   * Unassign route from bus
   */
  async unassignRoute(busId) {
    return await Bus.findByIdAndUpdate(
      busId,
      {
        $unset: { "operationalDetails.assignedRoute": 1 },
        $set: { lastModifiedAt: new Date() },
      },
      { new: true }
    );
  }

  /**
   * Get buses by location (within radius)
   */
  async findByLocation(coordinates, radiusKm = 50) {
    return await Bus.find({
      status: "active",
      "location.current.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude],
          },
          $maxDistance: radiusKm * 1000, // Convert to meters
        },
      },
    }).populate([
      {
        path: "operationalDetails.operator",
        select:
          "profile.firstName profile.lastName organizationDetails.companyName",
      },
      {
        path: "operationalDetails.assignedRoute",
        select: "routeNumber routeName origin.city destination.city",
      },
    ]);
  }

  /**
   * Update bus statistics
   */
  async updateStatistics(busId, statsUpdate) {
    return await Bus.findByIdAndUpdate(
      busId,
      {
        $inc: {
          "statistics.totalTrips": statsUpdate.totalTrips || 0,
          "statistics.totalKilometers": statsUpdate.totalKilometers || 0,
          "statistics.passengerCount": statsUpdate.passengerCount || 0,
        },
        $set: {
          "statistics.averageSpeed": statsUpdate.averageSpeed,
          "statistics.fuelEfficiency": statsUpdate.fuelEfficiency,
          "statistics.lastTripDate": new Date(),
          "statistics.monthlyRevenue": statsUpdate.monthlyRevenue,
        },
      },
      { new: true }
    );
  }
}

module.exports = new BusRepository();
