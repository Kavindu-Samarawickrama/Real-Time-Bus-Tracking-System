// src/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: [true, "Notification ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^NOT-\d{8}-\d{6}$/,
        "Notification ID must follow format NOT-YYYYMMDD-HHMMSS",
      ],
    },
    type: {
      type: String,
      enum: {
        values: [
          "trip_delay",
          "trip_cancellation",
          "trip_departure",
          "trip_arrival",
          "route_change",
          "emergency_alert",
          "maintenance_notice",
          "weather_warning",
          "system_announcement",
          "booking_confirmation",
          "payment_reminder",
          "schedule_update",
          "incident_report",
          "service_disruption",
        ],
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "normal", "high", "urgent", "critical"],
        message: "Priority must be low, normal, high, urgent, or critical",
      },
      default: "normal",
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    htmlContent: {
      type: String,
      trim: true,
    },
    recipients: {
      users: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          email: {
            type: String,
            required: true,
            lowercase: true,
            match: [
              /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
              "Invalid email format",
            ],
          },
          name: {
            type: String,
            required: true,
          },
          role: {
            type: String,
            enum: ["ntc_admin", "bus_operator", "commuter"],
            required: true,
          },
          delivered: {
            type: Boolean,
            default: false,
          },
          deliveredAt: Date,
          opened: {
            type: Boolean,
            default: false,
          },
          openedAt: Date,
          bounced: {
            type: Boolean,
            default: false,
          },
          bounceReason: String,
        },
      ],
      groups: [
        {
          type: String,
          enum: [
            "all_users",
            "ntc_admins",
            "bus_operators",
            "commuters",
            "route_subscribers",
          ],
        },
      ],
      totalRecipients: {
        type: Number,
        default: 0,
      },
    },
    relatedData: {
      trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
      },
      route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
      },
      bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
      },
      operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      incident: String, // Reference to incident ID
    },
    delivery: {
      channel: {
        type: String,
        enum: ["email", "sms", "push", "in_app"],
        default: "email",
      },
      status: {
        type: String,
        enum: [
          "draft",
          "queued",
          "sending",
          "sent",
          "delivered",
          "failed",
          "cancelled",
        ],
        default: "draft",
      },
      scheduledFor: Date,
      sentAt: Date,
      deliveredCount: {
        type: Number,
        default: 0,
      },
      failedCount: {
        type: Number,
        default: 0,
      },
      openedCount: {
        type: Number,
        default: 0,
      },
      clickedCount: {
        type: Number,
        default: 0,
      },
      retryCount: {
        type: Number,
        default: 0,
        max: [3, "Maximum 3 retry attempts allowed"],
      },
      lastRetryAt: Date,
    },
    template: {
      templateId: String,
      variables: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },
    targeting: {
      criteria: {
        roles: [String],
        routes: [mongoose.Schema.Types.ObjectId],
        operators: [mongoose.Schema.Types.ObjectId],
        locations: [
          {
            coordinates: {
              latitude: {
                type: Number,
                min: [5.9, "Latitude must be within Sri Lanka bounds"],
                max: [9.9, "Latitude must be within Sri Lanka bounds"],
              },
              longitude: {
                type: Number,
                min: [79.6, "Longitude must be within Sri Lanka bounds"],
                max: [81.9, "Longitude must be within Sri Lanka bounds"],
              },
            },
            radius: {
              type: Number, // in kilometers
              min: [1, "Radius must be at least 1 km"],
              max: [200, "Radius cannot exceed 200 km"],
            },
          },
        ],
        preferences: {
          allowMarketing: Boolean,
          allowOperational: Boolean,
          allowEmergency: Boolean,
        },
      },
    },
    analytics: {
      impressions: {
        type: Number,
        default: 0,
      },
      clicks: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          userAgent: String,
          ipAddress: String,
        },
      ],
      opens: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          userAgent: String,
          ipAddress: String,
        },
      ],
    },
    settings: {
      enableTracking: {
        type: Boolean,
        default: true,
      },
      expiresAt: Date,
      autoDelete: {
        type: Boolean,
        default: false,
      },
      allowUnsubscribe: {
        type: Boolean,
        default: true,
      },
    },
    metadata: {
      source: {
        type: String,
        enum: ["manual", "automated", "system", "api"],
        default: "manual",
      },
      tags: [String],
      category: String,
      campaign: String,
      batchId: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
      virtuals: true,
    },
  }
);

// Indexes for better performance
notificationSchema.index({ notificationId: 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ "delivery.status": 1 });
notificationSchema.index({ "delivery.scheduledFor": 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ "recipients.users.user": 1 });
notificationSchema.index({ "relatedData.trip": 1 });
notificationSchema.index({ "relatedData.route": 1 });
notificationSchema.index({ "settings.expiresAt": 1 });

// Virtual for delivery rate
notificationSchema.virtual("deliveryRate").get(function () {
  if (this.recipients.totalRecipients === 0) return 0;
  return Math.round(
    (this.delivery.deliveredCount / this.recipients.totalRecipients) * 100
  );
});

// Virtual for open rate
notificationSchema.virtual("openRate").get(function () {
  if (this.delivery.deliveredCount === 0) return 0;
  return Math.round(
    (this.delivery.openedCount / this.delivery.deliveredCount) * 100
  );
});

// Virtual for click rate
notificationSchema.virtual("clickRate").get(function () {
  if (this.delivery.openedCount === 0) return 0;
  return Math.round(
    (this.delivery.clickedCount / this.delivery.openedCount) * 100
  );
});

// Virtual for status summary
notificationSchema.virtual("statusSummary").get(function () {
  return {
    status: this.delivery.status,
    total: this.recipients.totalRecipients,
    delivered: this.delivery.deliveredCount,
    failed: this.delivery.failedCount,
    opened: this.delivery.openedCount,
    clicked: this.delivery.clickedCount,
  };
});

// Pre-save middleware to generate notification ID
notificationSchema.pre("save", function (next) {
  if (this.isNew && !this.notificationId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, "");
    this.notificationId = `NOT-${dateStr}-${timeStr}`;
  }
  next();
});

// Pre-save middleware to update recipient count
notificationSchema.pre("save", function (next) {
  if (this.isModified("recipients.users")) {
    this.recipients.totalRecipients = this.recipients.users.length;
  }
  next();
});

// Pre-save middleware to handle expiration
notificationSchema.pre("save", function (next) {
  if (this.isNew && !this.settings.expiresAt) {
    // Set default expiration based on type
    const hoursToAdd =
      this.priority === "urgent" || this.priority === "critical" ? 24 : 168; // 1 day or 1 week
    this.settings.expiresAt = new Date(
      Date.now() + hoursToAdd * 60 * 60 * 1000
    );
  }
  next();
});

// Instance method to mark as delivered for a user
notificationSchema.methods.markDelivered = function (
  userId,
  deliveredAt = new Date()
) {
  const recipient = this.recipients.users.find(
    (r) => r.user.toString() === userId.toString()
  );
  if (recipient && !recipient.delivered) {
    recipient.delivered = true;
    recipient.deliveredAt = deliveredAt;
    this.delivery.deliveredCount = (this.delivery.deliveredCount || 0) + 1;
  }
  return this.save();
};

// Instance method to mark as opened for a user
notificationSchema.methods.markOpened = function (
  userId,
  userAgent = null,
  ipAddress = null
) {
  const recipient = this.recipients.users.find(
    (r) => r.user.toString() === userId.toString()
  );
  if (recipient && recipient.delivered && !recipient.opened) {
    recipient.opened = true;
    recipient.openedAt = new Date();
    this.delivery.openedCount = (this.delivery.openedCount || 0) + 1;

    // Add to analytics
    this.analytics.opens.push({
      user: userId,
      timestamp: new Date(),
      userAgent,
      ipAddress,
    });
  }
  return this.save();
};

// Instance method to record click
notificationSchema.methods.recordClick = function (
  userId,
  userAgent = null,
  ipAddress = null
) {
  // Ensure the user has opened the notification first
  if (
    !this.analytics.opens.some((o) => o.user.toString() === userId.toString())
  ) {
    this.markOpened(userId, userAgent, ipAddress);
  }

  // Record click if not already recorded by this user
  const existingClick = this.analytics.clicks.find(
    (c) => c.user.toString() === userId.toString()
  );
  if (!existingClick) {
    this.analytics.clicks.push({
      user: userId,
      timestamp: new Date(),
      userAgent,
      ipAddress,
    });
    this.delivery.clickedCount = (this.delivery.clickedCount || 0) + 1;
  }

  return this.save();
};

// Instance method to check if expired
notificationSchema.methods.isExpired = function () {
  return this.settings.expiresAt && this.settings.expiresAt < new Date();
};

// Static method to find notifications by user
notificationSchema.statics.findByUser = function (
  userId,
  status = null,
  limit = 50
) {
  const query = { "recipients.users.user": userId };
  if (status) query["delivery.status"] = status;

  return this.find(query)
    .populate("relatedData.trip", "tripNumber route")
    .populate("relatedData.route", "routeNumber routeName")
    .populate("relatedData.bus", "registrationNumber")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find notifications by type and priority
notificationSchema.statics.findByTypeAndPriority = function (
  type,
  priority = null
) {
  const query = { type };
  if (priority) query.priority = priority;

  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find pending notifications
notificationSchema.statics.findPending = function () {
  return this.find({
    "delivery.status": { $in: ["queued", "sending"] },
    $or: [
      { "delivery.scheduledFor": { $lte: new Date() } },
      { "delivery.scheduledFor": { $exists: false } },
    ],
    "settings.expiresAt": { $gt: new Date() },
  }).sort({ priority: -1, createdAt: 1 });
};

// Static method to find failed notifications for retry
notificationSchema.statics.findForRetry = function () {
  return this.find({
    "delivery.status": "failed",
    "delivery.retryCount": { $lt: 3 },
    $or: [
      { "delivery.lastRetryAt": { $exists: false } },
      {
        "delivery.lastRetryAt": { $lt: new Date(Date.now() - 60 * 60 * 1000) },
      }, // 1 hour ago
    ],
    "settings.expiresAt": { $gt: new Date() },
  });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    "settings.expiresAt": { $lt: new Date() },
    "settings.autoDelete": true,
  });
};

module.exports = mongoose.model("Notification", notificationSchema);
