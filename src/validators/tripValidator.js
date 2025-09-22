// src/validators/tripValidator.js
const Joi = require("joi");

const tripStatuses = [
  "scheduled",
  "boarding",
  "departed",
  "in_transit",
  "delayed",
  "arrived",
  "completed",
  "cancelled",
];

const incidentTypes = [
  "breakdown",
  "accident",
  "traffic_jam",
  "road_closure",
  "passenger_incident",
  "fuel_shortage",
  "other",
];

const severityLevels = ["low", "medium", "high", "critical"];
const weatherConditions = ["clear", "cloudy", "rainy", "stormy", "foggy"];
const discountTypes = ["student", "senior", "disabled", "promotional"];
const tripTypes = ["regular", "express", "luxury", "special"];
const repeatPatterns = ["one_time", "daily", "weekly", "monthly"];
const priorityLevels = ["low", "normal", "high", "urgent"];
const waypointStatuses = [
  "pending",
  "approaching",
  "arrived",
  "departed",
  "skipped",
];
const notificationTypes = [
  "delay",
  "route_change",
  "cancellation",
  "boarding",
  "arrival",
];

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

// Schedule schema
const scheduleSchema = Joi.object({
  scheduledDeparture: Joi.date().min("now").required().messages({
    "date.min": "Scheduled departure cannot be in the past",
  }),
  scheduledArrival: Joi.date()
    .min(Joi.ref("scheduledDeparture"))
    .required()
    .messages({
      "date.min": "Scheduled arrival must be after departure",
    }),
  estimatedDeparture: Joi.date().optional(),
  estimatedArrival: Joi.date().optional(),
  actualDeparture: Joi.date().optional(),
  actualArrival: Joi.date().optional(),
});

// Crew schema
const crewSchema = Joi.object({
  driver: Joi.object({
    name: Joi.string().trim().max(100).required().messages({
      "string.max": "Driver name cannot exceed 100 characters",
    }),
    licenseNumber: Joi.string().trim().uppercase().required(),
    contactNumber: Joi.string()
      .pattern(/^(\+94|0)[0-9]{9}$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid Sri Lankan phone number",
      }),
  }).required(),
  conductor: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    contactNumber: Joi.string()
      .pattern(/^(\+94|0)[0-9]{9}$/)
      .optional()
      .messages({
        "string.pattern.base": "Please provide a valid Sri Lankan phone number",
      }),
  }).optional(),
});

// Capacity schema
const capacitySchema = Joi.object({
  totalSeats: Joi.number().integer().min(10).required().messages({
    "number.min": "Minimum capacity is 10 seats",
  }),
  bookedSeats: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Booked seats cannot be negative",
  }),
  availableSeats: Joi.number().integer().min(0).optional(),
  standingPassengers: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Standing passengers cannot be negative",
  }),
})
  .custom((value, helpers) => {
    if (value.bookedSeats > value.totalSeats) {
      return helpers.error("custom.bookedExceedsTotal");
    }
    return value;
  })
  .messages({
    "custom.bookedExceedsTotal": "Booked seats cannot exceed total seats",
  });

// Tracking schema
const trackingSchema = Joi.object({
  currentLocation: Joi.object({
    coordinates: coordinatesSchema.optional(),
    address: Joi.string().optional(),
    lastUpdated: Joi.date().optional(),
  }).optional(),
  speed: Joi.number().min(0).max(120).optional().messages({
    "number.min": "Speed cannot be negative",
    "number.max": "Maximum speed is 120 km/h",
  }),
  heading: Joi.number().min(0).max(359).optional().messages({
    "number.min": "Heading must be between 0-359 degrees",
    "number.max": "Heading must be between 0-359 degrees",
  }),
  distanceFromOrigin: Joi.number().min(0).optional().messages({
    "number.min": "Distance cannot be negative",
  }),
  distanceToDestination: Joi.number().min(0).optional().messages({
    "number.min": "Distance cannot be negative",
  }),
  nextWaypoint: Joi.object({
    name: Joi.string().optional(),
    estimatedArrival: Joi.date().optional(),
    distanceAway: Joi.number().min(0).optional(),
  }).optional(),
});

// Waypoint schema
const waypointSchema = Joi.object({
  waypointRef: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid waypoint reference ID format",
    }),
  name: Joi.string().required(),
  scheduledArrival: Joi.date().required(),
  scheduledDeparture: Joi.date()
    .min(Joi.ref("scheduledArrival"))
    .required()
    .messages({
      "date.min": "Departure must be after arrival",
    }),
  estimatedArrival: Joi.date().optional(),
  estimatedDeparture: Joi.date().optional(),
  actualArrival: Joi.date().optional(),
  actualDeparture: Joi.date().optional(),
  status: Joi.string()
    .valid(...waypointStatuses)
    .default("pending"),
  passengerActivity: Joi.object({
    boarded: Joi.number().integer().min(0).default(0),
    alighted: Joi.number().integer().min(0).default(0),
  }).optional(),
});

// Fare schema
const fareSchema = Joi.object({
  baseFare: Joi.number().min(0).required().messages({
    "number.min": "Base fare cannot be negative",
  }),
  currency: Joi.string().valid("LKR").default("LKR"),
  discounts: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(...discountTypes)
          .required(),
        percentage: Joi.number().min(0).max(100).optional().messages({
          "number.min": "Discount percentage cannot be negative",
          "number.max": "Discount percentage cannot exceed 100%",
        }),
        amount: Joi.number().min(0).optional().messages({
          "number.min": "Discount amount cannot be negative",
        }),
      })
    )
    .optional(),
});

// Incident schema
const incidentSchema = Joi.object({
  timestamp: Joi.date().default(Date.now),
  type: Joi.string()
    .valid(...incidentTypes)
    .required(),
  description: Joi.string().max(500).required().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  location: Joi.object({
    coordinates: coordinatesSchema.optional(),
    address: Joi.string().optional(),
  }).optional(),
  severity: Joi.string()
    .valid(...severityLevels)
    .default("medium"),
  resolved: Joi.boolean().default(false),
  resolvedAt: Joi.date().optional(),
  reportedBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

// Trip creation validation
const createTripSchema = Joi.object({
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid route ID format",
    }),
  bus: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid bus ID format",
    }),
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid operator ID format",
    }),
  schedule: scheduleSchema.required(),
  crew: crewSchema.required(),
  capacity: capacitySchema.required(),
  waypoints: Joi.array().items(waypointSchema).optional(),
  fare: fareSchema.required(),
  weather: Joi.object({
    conditions: Joi.string()
      .valid(...weatherConditions)
      .optional(),
    temperature: Joi.number().optional(),
    visibility: Joi.number().min(0).optional(),
  }).optional(),
  metadata: Joi.object({
    tripType: Joi.string()
      .valid(...tripTypes)
      .default("regular"),
    repeatPattern: Joi.string()
      .valid(...repeatPatterns)
      .default("one_time"),
    parentTrip: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    priority: Joi.string()
      .valid(...priorityLevels)
      .default("normal"),
  }).optional(),
});

// Trip update validation
const updateTripSchema = Joi.object({
  schedule: scheduleSchema.optional(),
  crew: crewSchema.optional(),
  capacity: capacitySchema.optional(),
  status: Joi.string()
    .valid(...tripStatuses)
    .optional(),
  tracking: trackingSchema.optional(),
  fare: fareSchema.optional(),
  weather: Joi.object({
    conditions: Joi.string()
      .valid(...weatherConditions)
      .optional(),
    temperature: Joi.number().optional(),
    visibility: Joi.number().min(0).optional(),
  }).optional(),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string()).optional(),
    priority: Joi.string()
      .valid(...priorityLevels)
      .optional(),
  }).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Status update validation
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...tripStatuses)
    .required(),
  updateData: Joi.object({
    estimatedDeparture: Joi.date().optional(),
    estimatedArrival: Joi.date().optional(),
    actualDeparture: Joi.date().optional(),
    actualArrival: Joi.date().optional(),
    reason: Joi.string().max(500).optional(),
  }).optional(),
});

// Location update validation
const updateLocationSchema = Joi.object({
  coordinates: coordinatesSchema.required(),
  address: Joi.string().optional(),
  speed: Joi.number().min(0).max(120).required(),
  heading: Joi.number().min(0).max(359).required(),
  distanceFromOrigin: Joi.number().min(0).optional(),
  distanceToDestination: Joi.number().min(0).optional(),
  timestamp: Joi.date().default(Date.now),
});

// Query validation for trip listing
const tripQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // Filter options
  status: Joi.string()
    .valid(...tripStatuses)
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

  // Date filters
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional().messages({
    "date.min": "End date must be after start date",
  }),

  // Search options
  search: Joi.string().trim().min(1).optional(),
  tripNumber: Joi.string().trim().optional(),

  // Trip type filters
  tripType: Joi.string()
    .valid(...tripTypes)
    .optional(),
  priority: Joi.string()
    .valid(...priorityLevels)
    .optional(),

  // Status filters
  delayed: Joi.boolean().optional(),
  active: Joi.boolean().optional(),
  completed: Joi.boolean().optional(),

  // Sorting
  sortBy: Joi.string()
    .valid(
      "createdAt",
      "schedule.scheduledDeparture",
      "tripNumber",
      "status",
      "delay"
    )
    .default("schedule.scheduledDeparture"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
});

// Trip search validation
const tripSearchSchema = Joi.object({
  origin: Joi.alternatives()
    .try(Joi.string().trim(), coordinatesSchema)
    .optional(),
  destination: Joi.alternatives()
    .try(Joi.string().trim(), coordinatesSchema)
    .optional(),
  travelDate: Joi.date().min("now").optional(),
  departureTimeFrom: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  departureTimeTo: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  tripType: Joi.string()
    .valid(...tripTypes)
    .optional(),
  maxFare: Joi.number().min(0).optional(),
  amenities: Joi.array()
    .items(
      Joi.string().valid(
        "airConditioning",
        "wifi",
        "chargingPorts",
        "entertainment",
        "restroom",
        "recliningSeats",
        "gpsTracking",
        "cctv"
      )
    )
    .optional(),
  availableSeats: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Bulk operations validation
const bulkUpdateStatusSchema = Joi.object({
  tripIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one trip ID is required",
      "array.max": "Cannot update more than 50 trips at once",
      "string.pattern.base": "Invalid trip ID format",
    }),
  status: Joi.string()
    .valid(...tripStatuses)
    .required(),
  reason: Joi.string().trim().max(500).optional(),
});

// Passenger activity validation
const passengerActivitySchema = Joi.object({
  waypointRef: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  boarded: Joi.number().integer().min(0).default(0),
  alighted: Joi.number().integer().min(0).default(0),
});

// Rating validation
const addRatingSchema = Joi.object({
  overall: Joi.number().min(1).max(5).required(),
  punctuality: Joi.number().min(1).max(5).optional(),
  comfort: Joi.number().min(1).max(5).optional(),
  driverBehavior: Joi.number().min(1).max(5).optional(),
  cleanliness: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().max(500).optional().messages({
    "string.max": "Comment cannot exceed 500 characters",
  }),
});

// Notification validation
const addNotificationSchema = Joi.object({
  type: Joi.string()
    .valid(...notificationTypes)
    .required(),
  message: Joi.string().required(),
  timestamp: Joi.date().default(Date.now),
});

// Revenue update validation
const updateRevenueSchema = Joi.object({
  totalRevenue: Joi.number().min(0).optional(),
  ticketsSold: Joi.number().integer().min(0).optional(),
  expenses: Joi.object({
    fuel: Joi.number().min(0).optional(),
    toll: Joi.number().min(0).optional(),
    maintenance: Joi.number().min(0).optional(),
    other: Joi.number().min(0).optional(),
  }).optional(),
});

// Waypoint update validation
const updateWaypointSchema = Joi.object({
  waypointRef: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  status: Joi.string()
    .valid(...waypointStatuses)
    .optional(),
  actualArrival: Joi.date().optional(),
  actualDeparture: Joi.date().optional(),
  estimatedArrival: Joi.date().optional(),
  estimatedDeparture: Joi.date().optional(),
  passengerActivity: Joi.object({
    boarded: Joi.number().integer().min(0).optional(),
    alighted: Joi.number().integer().min(0).optional(),
  }).optional(),
});

// Trip analytics validation
const tripAnalyticsSchema = Joi.object({
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional(),
  groupBy: Joi.string()
    .valid("day", "week", "month", "route", "operator")
    .default("day"),
});

// Schedule generation validation (for recurring trips)
const generateScheduleSchema = Joi.object({
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  bus: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  startDate: Joi.date().min("now").required(),
  endDate: Joi.date().min(Joi.ref("startDate")).required(),
  departureTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  frequency: Joi.string()
    .valid("daily", "weekdays", "weekends", "weekly")
    .required(),
  daysOfWeek: Joi.array()
    .items(
      Joi.number().integer().min(0).max(6) // 0 = Sunday, 6 = Saturday
    )
    .when("frequency", {
      is: "weekly",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  crew: crewSchema.required(),
  fare: fareSchema.required(),
});

// Live tracking validation
const liveTrackingSchema = Joi.object({
  coordinates: coordinatesSchema.required(),
  speed: Joi.number().min(0).max(120).required(),
  heading: Joi.number().min(0).max(359).required(),
  accuracy: Joi.number().min(0).optional(), // GPS accuracy in meters
  altitude: Joi.number().optional(),
  timestamp: Joi.date().default(Date.now),
  batteryLevel: Joi.number().min(0).max(100).optional(), // Device battery level
  signalStrength: Joi.number().min(0).max(100).optional(), // Network signal strength
});

module.exports = {
  createTripSchema,
  updateTripSchema,
  updateStatusSchema,
  updateLocationSchema,
  tripQuerySchema,
  tripSearchSchema,
  bulkUpdateStatusSchema,
  passengerActivitySchema,
  addRatingSchema,
  addNotificationSchema,
  updateRevenueSchema,
  updateWaypointSchema,
  tripAnalyticsSchema,
  generateScheduleSchema,
  liveTrackingSchema,
  incidentSchema,
};
