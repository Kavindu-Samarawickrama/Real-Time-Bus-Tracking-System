// src/repositories/notificationRepository.js
const Notification = require("../models/Notification");
const { ApiError } = require("../utils/errors");

class NotificationRepository {
  /**
   * Create a new notification
   */
  async create(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return await this.findById(notification._id); // Return populated notification
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(
          `Notification with this ${field} already exists`,
          409
        );
      }
      throw error;
    }
  }

  /**
   * Find notification by ID
   */
  async findById(id, populate = true) {
    try {
      let query = Notification.findById(id);

      if (populate) {
        query = query.populate([
          {
            path: "recipients.users.user",
            select: "profile.firstName profile.lastName email role status",
          },
          {
            path: "relatedData.trip",
            select: "tripNumber route bus status schedule",
          },
          {
            path: "relatedData.route",
            select: "routeNumber routeName origin.city destination.city",
          },
          {
            path: "relatedData.bus",
            select:
              "registrationNumber vehicleDetails.make vehicleDetails.model",
          },
          {
            path: "relatedData.operator",
            select:
              "profile.firstName profile.lastName organizationDetails.companyName",
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

      const notification = await query.exec();
      return notification;
    } catch (error) {
      throw new ApiError("Invalid notification ID format", 400);
    }
  }

  /**
   * Find notification by notification ID
   */
  async findByNotificationId(notificationId, populate = true) {
    let query = Notification.findOne({
      notificationId: notificationId.toUpperCase(),
    });

    if (populate) {
      query = query.populate([
        {
          path: "recipients.users.user",
          select: "profile.firstName profile.lastName email",
        },
        {
          path: "relatedData.trip",
          select: "tripNumber route",
        },
      ]);
    }

    return await query.exec();
  }

  /**
   * Update notification by ID
   */
  async updateById(id, updateData) {
    try {
      const notification = await Notification.findByIdAndUpdate(
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
          path: "recipients.users.user",
          select: "profile.firstName profile.lastName email",
        },
      ]);
      return notification;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ApiError(
          `Notification with this ${field} already exists`,
          409
        );
      }
      throw error;
    }
  }

  /**
   * Delete notification by ID
   */
  async deleteById(id) {
    try {
      const notification = await Notification.findByIdAndDelete(id);
      return notification;
    } catch (error) {
      throw new ApiError("Invalid notification ID format", 400);
    }
  }

  /**
   * Get notifications with pagination and filters
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      type,
      priority,
      status,
      channel,
      dateFrom,
      dateTo,
      userId,
      role,
      trip,
      route,
      bus,
      operator,
      unread,
      delivered,
      expired,
    } = options;

    // Build query
    const query = { ...filters };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (status) query["delivery.status"] = status;
    if (channel) query["delivery.channel"] = channel;
    if (trip) query["relatedData.trip"] = trip;
    if (route) query["relatedData.route"] = route;
    if (bus) query["relatedData.bus"] = bus;
    if (operator) query["relatedData.operator"] = operator;

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = dateFrom;
      if (dateTo) query.createdAt.$lte = dateTo;
    }

    // User-specific filters
    if (userId) {
      query["recipients.users.user"] = userId;

      if (unread) {
        query["recipients.users.opened"] = false;
      }
      if (delivered !== undefined) {
        query["recipients.users.delivered"] = delivered;
      }
    }

    // Role filter
    if (role) {
      query["recipients.users.role"] = role;
    }

    // Expired filter
    if (expired !== undefined) {
      const now = new Date();
      if (expired) {
        query["settings.expiresAt"] = { $lt: now };
      } else {
        query["settings.expiresAt"] = { $gte: now };
      }
    }

    // General search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { notificationId: { $regex: search, $options: "i" } },
        { "metadata.tags": { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate([
          {
            path: "recipients.users.user",
            select: "profile.firstName profile.lastName email role",
          },
          {
            path: "relatedData.trip",
            select: "tripNumber route",
          },
          {
            path: "relatedData.route",
            select: "routeNumber routeName",
          },
          {
            path: "createdBy",
            select: "profile.firstName profile.lastName",
          },
        ])
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find notifications by user
   */
  async findByUser(userId, status = null, limit = 50) {
    return await Notification.findByUser(userId, status, limit);
  }

  /**
   * Find notifications by type and priority
   */
  async findByTypeAndPriority(type, priority = null) {
    return await Notification.findByTypeAndPriority(type, priority);
  }

  /**
   * Find pending notifications for sending
   */
  async findPending() {
    return await Notification.findPending().populate([
      {
        path: "recipients.users.user",
        select: "profile.firstName profile.lastName email preferences",
      },
    ]);
  }

  /**
   * Find failed notifications for retry
   */
  async findForRetry() {
    return await Notification.findForRetry().populate([
      {
        path: "recipients.users.user",
        select: "profile.firstName profile.lastName email",
      },
    ]);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(dateFrom = null, dateTo = null) {
    const matchCondition = {};

    if (dateFrom || dateTo) {
      matchCondition.createdAt = {};
      if (dateFrom) matchCondition.createdAt.$gte = dateFrom;
      if (dateTo) matchCondition.createdAt.$lte = dateTo;
    }

    const stats = await Notification.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            type: "$type",
            status: "$delivery.status",
          },
          count: { $sum: 1 },
          totalRecipients: { $sum: "$recipients.totalRecipients" },
          deliveredCount: { $sum: "$delivery.deliveredCount" },
          openedCount: { $sum: "$delivery.openedCount" },
          clickedCount: { $sum: "$delivery.clickedCount" },
          failedCount: { $sum: "$delivery.failedCount" },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
              totalRecipients: "$totalRecipients",
              deliveredCount: "$deliveredCount",
              openedCount: "$openedCount",
              clickedCount: "$clickedCount",
              failedCount: "$failedCount",
            },
          },
          total: { $sum: "$count" },
        },
      },
      {
        $project: {
          type: "$_id",
          statuses: 1,
          total: 1,
          _id: 0,
        },
      },
    ]);

    // Get priority distribution
    const priorityStats = await Notification.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
          avgDeliveryRate: {
            $avg: {
              $cond: [
                { $eq: ["$recipients.totalRecipients", 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        "$delivery.deliveredCount",
                        "$recipients.totalRecipients",
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      typeStats: stats,
      priorityStats,
    };
  }

  /**
   * Get recently created notifications
   */
  async getRecentNotifications(days = 7, limit = 10) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await Notification.find({
      createdAt: { $gte: dateThreshold },
    })
      .populate([
        {
          path: "createdBy",
          select: "profile.firstName profile.lastName",
        },
      ])
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Bulk update notifications
   */
  async bulkUpdate(filter, updateData) {
    return await Notification.updateMany(filter, {
      $set: { ...updateData, lastModifiedAt: new Date() },
    });
  }

  /**
   * Mark notification as delivered for user
   */
  async markDelivered(notificationId, userId, deliveredAt = new Date()) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new ApiError("Notification not found", 404);

    return await notification.markDelivered(userId, deliveredAt);
  }

  /**
   * Mark notification as opened for user
   */
  async markOpened(notificationId, userId, userAgent = null, ipAddress = null) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new ApiError("Notification not found", 404);

    return await notification.markOpened(userId, userAgent, ipAddress);
  }

  /**
   * Record notification click
   */
  async recordClick(
    notificationId,
    userId,
    userAgent = null,
    ipAddress = null
  ) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new ApiError("Notification not found", 404);

    return await notification.recordClick(userId, userAgent, ipAddress);
  }

  /**
   * Find notifications for analytics
   */
  async findForAnalytics(filters = {}) {
    const {
      dateFrom,
      dateTo,
      type,
      priority,
      channel,
      groupBy = "day",
    } = filters;

    const matchCondition = {};
    if (type) matchCondition.type = type;
    if (priority) matchCondition.priority = priority;
    if (channel) matchCondition["delivery.channel"] = channel;
    if (dateFrom || dateTo) {
      matchCondition.createdAt = {};
      if (dateFrom) matchCondition.createdAt.$gte = dateFrom;
      if (dateTo) matchCondition.createdAt.$lte = dateTo;
    }

    let groupByFormat;
    switch (groupBy) {
      case "week":
        groupByFormat = { $week: "$createdAt" };
        break;
      case "month":
        groupByFormat = { $month: "$createdAt" };
        break;
      case "type":
        groupByFormat = "$type";
        break;
      case "priority":
        groupByFormat = "$priority";
        break;
      case "channel":
        groupByFormat = "$delivery.channel";
        break;
      default: // day
        groupByFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    return await Notification.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: groupByFormat,
          totalNotifications: { $sum: 1 },
          totalRecipients: { $sum: "$recipients.totalRecipients" },
          deliveredCount: { $sum: "$delivery.deliveredCount" },
          openedCount: { $sum: "$delivery.openedCount" },
          clickedCount: { $sum: "$delivery.clickedCount" },
          failedCount: { $sum: "$delivery.failedCount" },
          avgDeliveryRate: {
            $avg: {
              $cond: [
                { $eq: ["$recipients.totalRecipients", 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        "$delivery.deliveredCount",
                        "$recipients.totalRecipients",
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
          avgOpenRate: {
            $avg: {
              $cond: [
                { $eq: ["$delivery.deliveredCount", 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: [
                        "$delivery.openedCount",
                        "$delivery.deliveredCount",
                      ],
                    },
                    100,
                  ],
                },
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Cleanup expired notifications
   */
  async cleanupExpired() {
    return await Notification.cleanupExpired();
  }

  /**
   * Find notifications by related data
   */
  async findByRelatedData(type, entityId) {
    const query = {};
    query[`relatedData.${type}`] = entityId;

    return await Notification.find(query)
      .populate([
        {
          path: "recipients.users.user",
          select: "profile.firstName profile.lastName email",
        },
      ])
      .sort({ createdAt: -1 });
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationCount(userId, filters = {}) {
    const query = { "recipients.users.user": userId };

    // Apply additional filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined) {
        query[key] = filters[key];
      }
    });

    const counts = await Notification.aggregate([
      { $match: query },
      { $unwind: "$recipients.users" },
      {
        $match: {
          "recipients.users.user": new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ["$recipients.users.opened", false] }, 1, 0],
            },
          },
          delivered: {
            $sum: {
              $cond: [{ $eq: ["$recipients.users.delivered", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    return counts[0] || { total: 0, unread: 0, delivered: 0 };
  }

  /**
   * Create batch notifications
   */
  async createBatch(notificationsData, batchId = null) {
    try {
      // Add batch ID to all notifications if provided
      if (batchId) {
        notificationsData.forEach((data) => {
          data.metadata = data.metadata || {};
          data.metadata.batchId = batchId;
        });
      }

      const notifications = await Notification.insertMany(notificationsData, {
        ordered: false,
      });
      return notifications;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(notificationId, status, additionalData = {}) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: {
          "delivery.status": status,
          "delivery.sentAt": status === "sent" ? new Date() : undefined,
          ...additionalData,
        },
      },
      { new: true }
    );
  }

  /**
   * Find notifications by batch ID
   */
  async findByBatchId(batchId) {
    return await Notification.find({ "metadata.batchId": batchId })
      .populate([
        {
          path: "recipients.users.user",
          select: "profile.firstName profile.lastName email",
        },
      ])
      .sort({ createdAt: -1 });
  }
}

module.exports = new NotificationRepository();
