// src/validators/routeValidator.js
const Joi = require("joi");

const provinces = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

const routeTypes = ["express", "semi_express", "normal", "luxury"];
const statuses = ["active", "inactive", "suspended", "maintenance"];

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

// Location schema (origin/destination)
const locationSchema = Joi.object({
  city: Joi.string().trim().max(50).required().messages({
    "string.max": "City name cannot exceed 50 characters",
  }),
  province: Joi.string()
    .valid(...provinces)
    .required(),
  coordinates: coordinatesSchema.required(),
  terminalName: Joi.string().trim().max(100).optional(),
});

// Waypoint schema
const waypointSchema = Joi.object({
  name: Joi.string().trim().max(50).required().messages({
    "string.max": "Waypoint name cannot exceed 50 characters",
  }),
  city: Joi.string().trim().max(50).optional(),
  coordinates: coordinatesSchema.required(),
  estimatedTravelTime: Joi.number().integer().min(0).required().messages({
    "number.min": "Travel time cannot be negative",
  }),
  stopOrder: Joi.number().integer().min(1).required().messages({
    "number.min": "Stop order must be at least 1",
  }),
  stopDuration: Joi.number().integer().min(0).max(60).default(5).messages({
    "number.min": "Stop duration cannot be negative",
    "number.max": "Stop duration cannot exceed 60 minutes",
  }),
});

// Time validation (HH:MM format)
const timeSchema = Joi.string()
  .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  .messages({
    "string.pattern.base": "Invalid time format. Use HH:MM (24-hour format)",
  });

// Operating hours schema
const operatingHoursSchema = Joi.object({
  firstDeparture: timeSchema.required(),
  lastDeparture: timeSchema.required(),
  frequency: Joi.number().integer().min(15).max(480).required().messages({
    "number.min": "Minimum frequency is 15 minutes",
    "number.max": "Maximum frequency is 8 hours (480 minutes)",
  }),
})
  .custom((value, helpers) => {
    const [firstHour, firstMinute] = value.firstDeparture
      .split(":")
      .map(Number);
    const [lastHour, lastMinute] = value.lastDeparture.split(":").map(Number);

    const firstTime = firstHour * 60 + firstMinute;
    const lastTime = lastHour * 60 + lastMinute;

    if (lastTime <= firstTime) {
      return helpers.error("custom.invalidTimeRange");
    }

    return value;
  })
  .messages({
    "custom.invalidTimeRange": "Last departure must be after first departure",
  });

// Weekly schedule schema
const weeklyScheduleSchema = Joi.object({
  monday: Joi.boolean().default(true),
  tuesday: Joi.boolean().default(true),
  wednesday: Joi.boolean().default(true),
  thursday: Joi.boolean().default(true),
  friday: Joi.boolean().default(true),
  saturday: Joi.boolean().default(true),
  sunday: Joi.boolean().default(true),
});

// Amenities schema
const amenitiesSchema = Joi.object({
  airConditioned: Joi.boolean().default(false),
  wifi: Joi.boolean().default(false),
  chargingPorts: Joi.boolean().default(false),
  restroom: Joi.boolean().default(false),
  entertainment: Joi.boolean().default(false),
});

// Fare schema
const fareSchema = Joi.object({
  baseFare: Joi.number().min(0).required().messages({
    "number.min": "Base fare cannot be negative",
  }),
  currency: Joi.string().valid("LKR").default("LKR"),
});

// Route creation validation
const createRouteSchema = Joi.object({
  routeNumber: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .max(20)
    .required()
    .messages({
      "string.pattern.base":
        "Route number can only contain letters, numbers, and hyphens",
      "string.max": "Route number cannot exceed 20 characters",
    }),

  routeName: Joi.string().trim().max(100).required().messages({
    "string.max": "Route name cannot exceed 100 characters",
  }),

  origin: locationSchema.required(),
  destination: locationSchema.required(),

  waypoints: Joi.array()
    .items(waypointSchema)
    .optional()
    .custom((waypoints, helpers) => {
      if (!waypoints || waypoints.length === 0) return waypoints;

      // Check for duplicate stop orders
      const orders = waypoints.map((w) => w.stopOrder);
      const uniqueOrders = [...new Set(orders)];
      if (orders.length !== uniqueOrders.length) {
        return helpers.error("custom.duplicateStopOrders");
      }

      // Check for sequential ordering
      const sortedOrders = [...orders].sort((a, b) => a - b);
      for (let i = 0; i < sortedOrders.length; i++) {
        if (sortedOrders[i] !== i + 1) {
          return helpers.error("custom.nonSequentialStopOrders");
        }
      }

      return waypoints;
    })
    .messages({
      "custom.duplicateStopOrders": "Waypoint stop orders must be unique",
      "custom.nonSequentialStopOrders":
        "Waypoint stop orders must be sequential starting from 1",
    }),

  distance: Joi.number().min(1).required().messages({
    "number.min": "Distance must be at least 1 km",
  }),

  estimatedDuration: Joi.number().integer().min(10).required().messages({
    "number.min": "Estimated duration must be at least 10 minutes",
  }),

  operatingHours: operatingHoursSchema.required(),
  routeType: Joi.string()
    .valid(...routeTypes)
    .default("normal"),

  operatedBy: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one operator is required",
      "string.pattern.base": "Invalid operator ID format",
    }),

  fare: fareSchema.required(),
  amenities: amenitiesSchema.optional(),
  weeklySchedule: weeklyScheduleSchema.optional(),
});

// Route update validation
const updateRouteSchema = Joi.object({
  routeName: Joi.string().trim().max(100).optional(),
  origin: locationSchema.optional(),
  destination: locationSchema.optional(),
  waypoints: Joi.array().items(waypointSchema).optional(),
  distance: Joi.number().min(1).optional(),
  estimatedDuration: Joi.number().integer().min(10).optional(),
  operatingHours: operatingHoursSchema.optional(),
  routeType: Joi.string()
    .valid(...routeTypes)
    .optional(),
  operatedBy: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional(),
  fare: fareSchema.optional(),
  amenities: amenitiesSchema.optional(),
  weeklySchedule: weeklyScheduleSchema.optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Route status update validation
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...statuses)
    .required(),
  reason: Joi.string().trim().max(500).optional().messages({
    "string.max": "Reason cannot exceed 500 characters",
  }),
});

// Route query validation
const routeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // Filter options
  routeType: Joi.string()
    .valid(...routeTypes)
    .optional(),
  status: Joi.string()
    .valid(...statuses)
    .optional(),
  province: Joi.string()
    .valid(...provinces)
    .optional(),

  // Search options
  search: Joi.string().trim().min(1).optional(),
  originCity: Joi.string().trim().optional(),
  destinationCity: Joi.string().trim().optional(),
  routeNumber: Joi.string().trim().optional(),

  // Operator filter
  operatedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),

  // Sorting
  sortBy: Joi.string()
    .valid(
      "createdAt",
      "routeNumber",
      "routeName",
      "distance",
      "estimatedDuration",
      "fare.baseFare"
    )
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),

  // Special filters
  interProvincialOnly: Joi.boolean().optional(),
  amenities: Joi.array()
    .items(
      Joi.string().valid(
        "airConditioned",
        "wifi",
        "chargingPorts",
        "restroom",
        "entertainment"
      )
    )
    .optional(),
});

// Route search validation
const routeSearchSchema = Joi.object({
  origin: Joi.alternatives()
    .try(Joi.string().trim(), coordinatesSchema)
    .optional(),
  destination: Joi.alternatives()
    .try(Joi.string().trim(), coordinatesSchema)
    .optional(),
  travelDate: Joi.date().min("now").optional(),
  routeType: Joi.string()
    .valid(...routeTypes)
    .optional(),
  maxDistance: Joi.number().min(1).optional(),
  maxDuration: Joi.number().min(10).optional(),
  amenities: Joi.array()
    .items(
      Joi.string().valid(
        "airConditioned",
        "wifi",
        "chargingPorts",
        "restroom",
        "entertainment"
      )
    )
    .optional(),
  maxFare: Joi.number().min(0).optional(),
});

// Bulk operations validation
const bulkUpdateStatusSchema = Joi.object({
  routeIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one route ID is required",
      "array.max": "Cannot update more than 50 routes at once",
      "string.pattern.base": "Invalid route ID format",
    }),
  status: Joi.string()
    .valid(...statuses)
    .required(),
  reason: Joi.string().trim().max(500).optional(),
});

module.exports = {
  createRouteSchema,
  updateRouteSchema,
  updateStatusSchema,
  routeQuerySchema,
  routeSearchSchema,
  bulkUpdateStatusSchema,
};
