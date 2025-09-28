// src/validators/trackingValidator.js
const Joi = require("joi");

const emergencyTypes = [
  "accident",
  "breakdown",
  "medical",
  "security",
  "fire",
  "other",
];
const alertTypes = [
  "speed_violation",
  "route_deviation",
  "geofence_entry",
  "geofence_exit",
  "emergency_button",
  "engine_issue",
  "fuel_low",
  "maintenance_due",
  "communication_loss",
];
const alertSeverities = ["low", "medium", "high", "critical"];
const trackingStatuses = [
  "active",
  "paused",
  "stopped",
  "completed",
  "emergency",
  "offline",
];
const connectionTypes = ["4G", "3G", "2G", "WiFi", "Offline"];
const accuracyLevels = ["high", "medium", "low", "battery_saving"];

// Coordinates validation for Sri Lanka
const coordinatesSchema = Joi.array()
  .items(Joi.number())
  .length(2)
  .custom((value, helpers) => {
    const [longitude, latitude] = value;
    if (
      latitude < 5.9 ||
      latitude > 9.9 ||
      longitude < 79.6 ||
      longitude > 81.9
    ) {
      return helpers.error("coordinates.bounds");
    }
    return value;
  })
  .messages({
    "coordinates.bounds": "Coordinates must be within Sri Lanka bounds",
  });

// Driver schema
const driverSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  contactNumber: Joi.string()
    .pattern(/^(\+94|0)[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Sri Lankan phone number",
    }),
  driverId: Joi.string().optional(),
});

// Location data schema
const locationDataSchema = Joi.object({
  coordinates: coordinatesSchema.required(),
  speed: Joi.number().min(0).max(120).optional(),
  heading: Joi.number().min(0).max(359).optional(),
  altitude: Joi.number().min(-100).max(3000).optional(),
  accuracy: Joi.number().min(0).optional(),
  timestamp: Joi.date().optional(),
  address: Joi.string().trim().optional(),
});

// Device info schema
const deviceInfoSchema = Joi.object({
  deviceId: Joi.string().optional(),
  model: Joi.string().optional(),
  os: Joi.string().optional(),
  appVersion: Joi.string().optional(),
  batteryLevel: Joi.number().min(0).max(100).optional(),
  signalStrength: Joi.number().min(0).max(100).optional(),
  connectionType: Joi.string()
    .valid(...connectionTypes)
    .optional(),
});

// Start tracking validation
const startTrackingSchema = Joi.object({
  trip: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid trip ID format",
    }),
  bus: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid bus ID format",
    }),
  driver: driverSchema.required(),
  realTimeData: locationDataSchema.required(),
  settings: Joi.object({
    updateInterval: Joi.number().min(10).max(300).default(30),
    trackingAccuracy: Joi.string()
      .valid(...accuracyLevels)
      .default("high"),
    alertsEnabled: Joi.boolean().default(true),
    shareLocation: Joi.boolean().default(true),
  }).optional(),
});

// Update location validation
const updateLocationSchema = Joi.object({
  coordinates: coordinatesSchema.required(),
  speed: Joi.number().min(0).max(120).optional(),
  heading: Joi.number().min(0).max(359).optional(),
  altitude: Joi.number().min(-100).max(3000).optional(),
  accuracy: Joi.number().min(0).optional(),
  timestamp: Joi.date().required(),
  address: Joi.string().trim().optional(),
});

// Emergency alert validation
const emergencySchema = Joi.object({
  type: Joi.string()
    .valid(...emergencyTypes)
    .required(),
  description: Joi.string().required().trim().max(500),
  severity: Joi.string()
    .valid(...alertSeverities)
    .default("critical"),
  location: Joi.object({
    coordinates: coordinatesSchema.optional(),
    address: Joi.string().trim().optional(),
  }).optional(),
});

// General alert validation
const alertSchema = Joi.object({
  type: Joi.string()
    .valid(...alertTypes)
    .required(),
  severity: Joi.string()
    .valid(...alertSeverities)
    .required(),
  message: Joi.string().required().trim().max(500),
  location: Joi.object({
    coordinates: coordinatesSchema.optional(),
    address: Joi.string().trim().optional(),
  }).optional(),
  metadata: Joi.object().optional(),
});

// Query validation for tracking sessions
const trackingQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // Filter options
  status: Joi.string()
    .valid(...trackingStatuses)
    .optional(),
  busId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  routeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  tripId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  driverId: Joi.string().optional(),

  // Date filters
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional().messages({
    "date.min": "End date must be after start date",
  }),

  // Status filters
  isOnline: Joi.boolean().optional(),
  inEmergency: Joi.boolean().optional(),

  // Location filters
  nearLatitude: Joi.number().min(5.9).max(9.9).optional(),
  nearLongitude: Joi.number().min(79.6).max(81.9).optional(),
  radiusKm: Joi.number().min(1).max(200).default(50),

  // Search
  search: Joi.string().trim().min(1).optional(),

  // Sorting
  sortBy: Joi.string()
    .valid(
      "realTimeData.timestamp",
      "metadata.startTime",
      "performance.averageSpeed",
      "performance.totalDistance",
      "trackingId"
    )
    .default("realTimeData.timestamp"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
})
  .custom((value, helpers) => {
    // Validate location filter completeness
    const hasLat = value.nearLatitude !== undefined;
    const hasLon = value.nearLongitude !== undefined;

    if (hasLat && !hasLon) {
      return helpers.error("location.incomplete", { field: "nearLongitude" });
    }
    if (hasLon && !hasLat) {
      return helpers.error("location.incomplete", { field: "nearLatitude" });
    }

    return value;
  })
  .messages({
    "location.incomplete":
      "Both latitude and longitude are required for location filtering",
  });

// Nearby buses query validation
const nearbyBusesSchema = Joi.object({
  latitude: Joi.number().min(5.9).max(9.9).required().messages({
    "number.min": "Latitude must be within Sri Lanka bounds (5.9 - 9.9)",
    "number.max": "Latitude must be within Sri Lanka bounds (5.9 - 9.9)",
  }),
  longitude: Joi.number().min(79.6).max(81.9).required().messages({
    "number.min": "Longitude must be within Sri Lanka bounds (79.6 - 81.9)",
    "number.max": "Longitude must be within Sri Lanka bounds (79.6 - 81.9)",
  }),
  radius: Joi.number().min(1).max(200).default(50).messages({
    "number.min": "Radius must be at least 1 km",
    "number.max": "Radius cannot exceed 200 km",
  }),
});

// Update settings validation
const updateSettingsSchema = Joi.object({
  updateInterval: Joi.number().min(10).max(300).optional().messages({
    "number.min": "Update interval must be at least 10 seconds",
    "number.max": "Update interval cannot exceed 5 minutes",
  }),
  trackingAccuracy: Joi.string()
    .valid(...accuracyLevels)
    .optional(),
  alertsEnabled: Joi.boolean().optional(),
  shareLocation: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one setting must be provided",
  });

// Heartbeat validation
const heartbeatSchema = Joi.object({
  deviceInfo: deviceInfoSchema.optional(),
  signalStrength: Joi.number().min(0).max(100).optional(),
  batteryLevel: Joi.number().min(0).max(100).optional(),
  connectionType: Joi.string()
    .valid(...connectionTypes)
    .optional(),
});

// Pause/Resume tracking validation
const pauseResumeSchema = Joi.object({
  reason: Joi.string().trim().max(200).optional(),
});

// Emergency resolution validation
const emergencyResolutionSchema = Joi.object({
  resolution: Joi.string().required().trim().max(500).messages({
    "string.max": "Resolution description cannot exceed 500 characters",
  }),
  notes: Joi.string().trim().max(1000).optional(),
});

// Analytics query validation
const analyticsQuerySchema = Joi.object({
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional(),
  groupBy: Joi.string()
    .valid("hour", "day", "week", "month", "status", "route")
    .default("day"),
  operatorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  routeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

// Cleanup validation
const cleanupSchema = Joi.object({
  days: Joi.number().integer().min(7).max(365).default(30).messages({
    "number.min": "Cannot cleanup data newer than 7 days",
    "number.max": "Cannot cleanup data older than 1 year",
  }),
  dryRun: Joi.boolean().default(false),
});

// Geofence validation
const geofenceSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  type: Joi.string()
    .valid("station", "terminal", "depot", "waypoint", "restricted_zone")
    .required(),
  coordinates: coordinatesSchema.required(),
  radius: Joi.number().min(10).max(5000).required().messages({
    "number.min": "Minimum geofence radius is 10 meters",
    "number.max": "Maximum geofence radius is 5km",
  }),
  alerts: Joi.object({
    onEntry: Joi.boolean().default(true),
    onExit: Joi.boolean().default(true),
  }).optional(),
});

// Bulk operations validation
const bulkUpdateSchema = Joi.object({
  trackingIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one tracking ID is required",
      "array.max": "Cannot update more than 50 tracking sessions at once",
    }),
  updateData: Joi.object({
    status: Joi.string()
      .valid(...trackingStatuses)
      .optional(),
    settings: updateSettingsSchema.optional(),
  })
    .min(1)
    .required(),
});

module.exports = {
  startTrackingSchema,
  updateLocationSchema,
  emergencySchema,
  alertSchema,
  trackingQuerySchema,
  nearbyBusesSchema,
  updateSettingsSchema,
  heartbeatSchema,
  pauseResumeSchema,
  emergencyResolutionSchema,
  analyticsQuerySchema,
  cleanupSchema,
  geofenceSchema,
  bulkUpdateSchema,
};
