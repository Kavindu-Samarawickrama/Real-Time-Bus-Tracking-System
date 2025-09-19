// src/repositories/userRepository.js
const User = require("../models/User");
const { ApiError } = require("../utils/errors");

class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id, includePassword = false) {
    try {
      const query = User.findById(id);
      if (includePassword) {
        query.select("+password");
      }
      const user = await query.exec();
      return user;
    } catch (error) {
      throw new ApiError("Invalid user ID format", 400);
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  /**
   * Find user by username
   */
  async findByUsername(username, includePassword = false) {
    const query = User.findOne({ username: username.toLowerCase() });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  /**
   * Find user by email or username
   */
  async findByEmailOrUsername(identifier, includePassword = false) {
    const query = User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  /**
   * Update user by ID
   */
  async updateById(id, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      );
      return user;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(`${field} already exists`, 409);
      }
      throw error;
    }
  }

  /**
   * Delete user by ID
   */
  async deleteById(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      return user;
    } catch (error) {
      throw new ApiError("Invalid user ID format", 400);
    }
  }

  /**
   * Get users with pagination and filters
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      role,
      status,
    } = options;

    // Build query
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(parseInt(limit)).exec(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find users by role
   */
  async findByRole(role, status = "active") {
    return await User.findByRole(role, status);
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username) {
    const user = await User.findOne({ username: username.toLowerCase() });
    return !!user;
  }

  /**
   * Get user stats by role
   */
  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: {
            role: "$role",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.role",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $project: {
          role: "$_id",
          statuses: 1,
          total: 1,
          _id: 0,
        },
      },
    ]);

    return stats;
  }

  /**
   * Find users with expired locks
   */
  async findExpiredLocks() {
    return await User.find({
      lockUntil: { $lt: new Date() },
    });
  }

  /**
   * Reset expired account locks
   */
  async resetExpiredLocks() {
    return await User.updateMany(
      { lockUntil: { $lt: new Date() } },
      { $unset: { lockUntil: 1, loginAttempts: 1 } }
    );
  }

  /**
   * Bulk update users
   */
  async bulkUpdate(filter, updateData) {
    return await User.updateMany(filter, { $set: updateData });
  }

  /**
   * Get recently registered users
   */
  async getRecentUsers(days = 7, limit = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await User.find({
      createdAt: { $gte: dateThreshold },
    })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Search users with advanced filters
   */
  async advancedSearch(searchParams) {
    const {
      query,
      roles,
      statuses,
      provinces,
      dateFrom,
      dateTo,
      hasOrganization,
      page = 1,
      limit = 10,
    } = searchParams;

    const filter = {};

    // Text search
    if (query) {
      filter.$or = [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { "profile.firstName": { $regex: query, $options: "i" } },
        { "profile.lastName": { $regex: query, $options: "i" } },
        { "organizationDetails.companyName": { $regex: query, $options: "i" } },
        {
          "organizationDetails.operatorLicense": {
            $regex: query,
            $options: "i",
          },
        },
      ];
    }

    // Role filter
    if (roles && roles.length > 0) {
      filter.role = { $in: roles };
    }

    // Status filter
    if (statuses && statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    // Province filter
    if (provinces && provinces.length > 0) {
      filter["profile.address.province"] = { $in: provinces };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Organization filter
    if (hasOrganization !== undefined) {
      if (hasOrganization) {
        filter.$or = [
          { "organizationDetails.operatorLicense": { $exists: true, $ne: "" } },
          { "organizationDetails.employeeId": { $exists: true, $ne: "" } },
        ];
      } else {
        filter.$and = [
          { "organizationDetails.operatorLicense": { $exists: false } },
          { "organizationDetails.employeeId": { $exists: false } },
        ];
      }
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}

module.exports = new UserRepository();
