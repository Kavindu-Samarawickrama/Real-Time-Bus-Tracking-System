// src/validators/notificationValidator.js
const Joi = require("joi");

const notificationTypes = [
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
];

const priorities = ["low", "normal", "high", "urgent", "critical"];
const deliveryStatuses = [
  "draft",
  "queued",
  "sending",
  "sent",
  "delivered",
  "failed",
  "cancelled",
];
const channels = ["email", "sms", "push", "in_app"];
const userRoles = ["ntc_admin", "bus_operator", "commuter"];
const recipientGroups = [
  "all_users",
  "ntc_admins",
  "bus_operators",
  "commuters",
  "route_subscribers",
];
const sources = ["manual", "automated", "system", "api"];

// Coordinates validation for Sri Lanka
const coordinatesSchema = Joi.object({
  latitude: Joi.number().min(5.9).max(9.9).required().messages({
    "number.min": "Latitude must be within Sri Lanka bounds (5.9 - 9.9)",
    "number.max": "Latitude must be within Sri Lanka bounds (5.9 - 9.9)",
  }),
  longitude: Joi.number().min(79.6).max(81.9).required().messages({
    "number.min": "Longitude must be within Sri Lanka bounds (79.6 - 81.9)",
    "number.max": "Longitude must be within Sri Lanka bounds (79.6 - 81.9)",
  }),
});

// Location targeting schema
const locationSchema = Joi.object({
  coordinates: coordinatesSchema.required(),
  radius: Joi.number().min(1).max(200).required().messages({
    "number.min": "Radius must be at least 1 km",
    "number.max": "Radius cannot exceed 200 km",
  }),
});

// Recipient schema
const recipientSchema = Joi.object({
  user: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),
  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  name: Joi.string().required(),
  role: Joi.string()
    .valid(...userRoles)
    .required(),
});

// Recipients schema
const recipientsSchema = Joi.object({
  users: Joi.array().items(recipientSchema).optional(),
  groups: Joi.array()
    .items(Joi.string().valid(...recipientGroups))
    .optional(),
})
  .or("users", "groups")
  .messages({
    "object.missing": "Either users or groups must be provided",
  });

// Related data schema
const relatedDataSchema = Joi.object({
  trip: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  bus: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  incident: Joi.string().optional(),
});

// Template variables schema
const templateVariablesSchema = Joi.object({
  templateId: Joi.string().optional(),
  variables: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives().try(
        Joi.string(),
        Joi.number(),
        Joi.boolean(),
        Joi.date()
      )
    )
    .optional(),
});

// Targeting criteria schema
const targetingSchema = Joi.object({
  criteria: Joi.object({
    roles: Joi.array()
      .items(Joi.string().valid(...userRoles))
      .optional(),
    routes: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .optional(),
    operators: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .optional(),
    locations: Joi.array().items(locationSchema).optional(),
    preferences: Joi.object({
      allowMarketing: Joi.boolean().optional(),
      allowOperational: Joi.boolean().optional(),
      allowEmergency: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Settings schema
const settingsSchema = Joi.object({
  enableTracking: Joi.boolean().default(true),
  expiresAt: Joi.date().min("now").optional().messages({
    "date.min": "Expiration date cannot be in the past",
  }),
  autoDelete: Joi.boolean().default(false),
  allowUnsubscribe: Joi.boolean().default(true),
});

// Metadata schema
const metadataSchema = Joi.object({
  source: Joi.string()
    .valid(...sources)
    .default("manual"),
  tags: Joi.array().items(Joi.string()).optional(),
  category: Joi.string().optional(),
  campaign: Joi.string().optional(),
  batchId: Joi.string().optional(),
});

// Notification creation validation
const createNotificationSchema = Joi.object({
  type: Joi.string()
    .valid(...notificationTypes)
    .required(),
  priority: Joi.string()
    .valid(...priorities)
    .default("normal"),
  title: Joi.string().trim().max(100).required().messages({
    "string.max": "Title cannot exceed 100 characters",
  }),
  message: Joi.string().trim().max(1000).required().messages({
    "string.max": "Message cannot exceed 1000 characters",
  }),
  htmlContent: Joi.string().optional(),
  recipients: recipientsSchema.required(),
  relatedData: relatedDataSchema.optional(),
  delivery: Joi.object({
    channel: Joi.string()
      .valid(...channels)
      .default("email"),
    scheduledFor: Joi.date().min("now").optional().messages({
      "date.min": "Scheduled time cannot be in the past",
    }),
  }).optional(),
  template: templateVariablesSchema.optional(),
  targeting: targetingSchema.optional(),
  settings: settingsSchema.optional(),
  metadata: metadataSchema.optional(),
});

// Notification update validation
const updateNotificationSchema = Joi.object({
  title: Joi.string().trim().max(100).optional(),
  message: Joi.string().trim().max(1000).optional(),
  htmlContent: Joi.string().optional(),
  priority: Joi.string()
    .valid(...priorities)
    .optional(),
  delivery: Joi.object({
    scheduledFor: Joi.date().min("now").optional(),
    status: Joi.string()
      .valid(...deliveryStatuses)
      .optional(),
  }).optional(),
  settings: settingsSchema.optional(),
  metadata: metadataSchema.optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Status update validation
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...deliveryStatuses)
    .required(),
  reason: Joi.string().trim().max(500).optional().messages({
    "string.max": "Reason cannot exceed 500 characters",
  }),
});

// Query validation for notification listing
const notificationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // Filter options
  type: Joi.string()
    .valid(...notificationTypes)
    .optional(),
  priority: Joi.string()
    .valid(...priorities)
    .optional(),
  status: Joi.string()
    .valid(...deliveryStatuses)
    .optional(),
  channel: Joi.string()
    .valid(...channels)
    .optional(),

  // Date filters
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional().messages({
    "date.min": "End date must be after start date",
  }),

  // Search options
  search: Joi.string().trim().min(1).optional(),

  // User filters
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  role: Joi.string()
    .valid(...userRoles)
    .optional(),

  // Related data filters
  trip: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  bus: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),

  // Special filters
  unread: Joi.boolean().optional(),
  delivered: Joi.boolean().optional(),
  expired: Joi.boolean().optional(),

  // Sorting
  sortBy: Joi.string()
    .valid(
      "createdAt",
      "priority",
      "type",
      "delivery.sentAt",
      "delivery.deliveredCount",
      "delivery.openedCount"
    )
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Bulk operations validation
const bulkUpdateStatusSchema = Joi.object({
  notificationIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one notification ID is required",
      "array.max": "Cannot update more than 50 notifications at once",
      "string.pattern.base": "Invalid notification ID format",
    }),
  status: Joi.string()
    .valid(...deliveryStatuses)
    .required(),
  reason: Joi.string().trim().max(500).optional(),
});

// User preferences validation
const userPreferencesSchema = Joi.object({
  email: Joi.object({
    enabled: Joi.boolean().default(true),
    types: Joi.array()
      .items(Joi.string().valid(...notificationTypes))
      .optional(),
  }).optional(),
  allowMarketing: Joi.boolean().default(false),
  allowOperational: Joi.boolean().default(true),
  allowEmergency: Joi.boolean().default(true),
  quietHours: Joi.object({
    enabled: Joi.boolean().default(false),
    start: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    end: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
  }).optional(),
  timezone: Joi.string().default("Asia/Colombo"),
});

// Notification template validation (renamed to avoid conflict)
const notificationTemplateSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string()
    .valid(...notificationTypes)
    .required(),
  subject: Joi.string().required(),
  htmlContent: Joi.string().required(),
  textContent: Joi.string().required(),
  variables: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().default(true),
});

// Analytics query validation
const analyticsQuerySchema = Joi.object({
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional(),
  type: Joi.string()
    .valid(...notificationTypes)
    .optional(),
  priority: Joi.string()
    .valid(...priorities)
    .optional(),
  channel: Joi.string()
    .valid(...channels)
    .optional(),
  groupBy: Joi.string()
    .valid("day", "week", "month", "type", "priority", "channel")
    .default("day"),
});

// Send test notification validation
const sendTestSchema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  message: Joi.string().trim().max(1000).required(),
  htmlContent: Joi.string().optional(),
  testEmail: Joi.string().email().required().messages({
    "string.email": "Please provide a valid test email address",
  }),
  type: Joi.string()
    .valid(...notificationTypes)
    .default("system_announcement"),
});

// Tracking validation
const trackingSchema = Joi.object({
  action: Joi.string().valid("open", "click").required(),
  userAgent: Joi.string().optional(),
  ipAddress: Joi.string().optional(),
});

// Subscription management validation
const subscriptionSchema = Joi.object({
  routes: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  operators: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  notificationTypes: Joi.array()
    .items(Joi.string().valid(...notificationTypes))
    .optional(),
  enabled: Joi.boolean().default(true),
});

// Batch notification validation
const batchNotificationSchema = Joi.object({
  notifications: Joi.array()
    .items(createNotificationSchema)
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one notification is required",
      "array.max": "Cannot create more than 100 notifications at once",
    }),
  batchId: Joi.string().optional(),
  scheduledFor: Joi.date().min("now").optional(),
});

module.exports = {
  createNotificationSchema,
  updateNotificationSchema,
  updateStatusSchema,
  notificationQuerySchema,
  bulkUpdateStatusSchema,
  userPreferencesSchema,
  notificationTemplateSchema,
  analyticsQuerySchema,
  sendTestSchema,
  trackingSchema,
  subscriptionSchema,
  batchNotificationSchema,
};
