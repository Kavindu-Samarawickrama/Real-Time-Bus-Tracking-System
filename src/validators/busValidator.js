// src/validators/busValidator.js
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

const busStatuses = [
  "active",
  "inactive",
  "maintenance",
  "out_of_service",
  "pending_approval",
];
const fuelTypes = ["diesel", "petrol", "cng", "electric", "hybrid"];
const transmissionTypes = ["manual", "automatic", "semi_automatic"];
const maintenanceTypes = ["routine", "repair", "inspection", "emergency"];
const violationStatuses = ["pending", "paid", "disputed", "waived"];

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

// Vehicle details schema
const vehicleDetailsSchema = Joi.object({
  make: Joi.string().trim().max(50).required().messages({
    "string.max": "Vehicle make cannot exceed 50 characters",
  }),
  model: Joi.string().trim().max(50).required().messages({
    "string.max": "Vehicle model cannot exceed 50 characters",
  }),
  year: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      "number.min": "Manufacturing year must be 1980 or later",
      "number.max": "Manufacturing year cannot be in the future",
    }),
  engineNumber: Joi.string().trim().uppercase().required(),
  chassisNumber: Joi.string().trim().uppercase().required(),
  fuelType: Joi.string()
    .valid(...fuelTypes)
    .default("diesel"),
  transmissionType: Joi.string()
    .valid(...transmissionTypes)
    .default("manual"),
});

// Capacity schema
const capacitySchema = Joi.object({
  totalSeats: Joi.number().integer().min(10).max(80).required().messages({
    "number.min": "Minimum seat capacity is 10",
    "number.max": "Maximum seat capacity is 80",
  }),
  standingCapacity: Joi.number().integer().min(0).max(40).default(0).messages({
    "number.min": "Standing capacity cannot be negative",
    "number.max": "Maximum standing capacity is 40",
  }),
  wheelchairAccessible: Joi.number()
    .integer()
    .min(0)
    .max(4)
    .default(0)
    .messages({
      "number.min": "Wheelchair accessible seats cannot be negative",
      "number.max": "Maximum wheelchair accessible seats is 4",
    }),
});

// Dimensions schema
const dimensionsSchema = Joi.object({
  length: Joi.number().min(6).max(18).required().messages({
    "number.min": "Minimum bus length is 6 meters",
    "number.max": "Maximum bus length is 18 meters",
  }),
  width: Joi.number().min(2).max(2.8).required().messages({
    "number.min": "Minimum bus width is 2 meters",
    "number.max": "Maximum bus width is 2.8 meters",
  }),
  height: Joi.number().min(2.5).max(4.2).required().messages({
    "number.min": "Minimum bus height is 2.5 meters",
    "number.max": "Maximum bus height is 4.2 meters",
  }),
});

// Amenities schema
const amenitiesSchema = Joi.object({
  airConditioning: Joi.boolean().default(false),
  wifi: Joi.boolean().default(false),
  chargingPorts: Joi.boolean().default(false),
  entertainment: Joi.boolean().default(false),
  restroom: Joi.boolean().default(false),
  recliningSeats: Joi.boolean().default(false),
  luggageCompartment: Joi.boolean().default(true),
  firstAidKit: Joi.boolean().default(true),
  fireExtinguisher: Joi.boolean().default(true),
  gpsTracking: Joi.boolean().default(true),
  cctv: Joi.boolean().default(false),
});

// Driver/Conductor schema
const personSchema = Joi.object({
  name: Joi.string().trim().max(100).optional().messages({
    "string.max": "Name cannot exceed 100 characters",
  }),
  licenseNumber: Joi.string().trim().uppercase().optional(),
  contactNumber: Joi.string()
    .pattern(/^(\+94|0)[0-9]{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid Sri Lankan phone number",
    }),
});

// Operational details schema
const operationalDetailsSchema = Joi.object({
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid operator ID format",
    }),
  assignedRoute: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid route ID format",
    }),
  currentDriver: personSchema.optional(),
  conductor: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    contactNumber: Joi.string()
      .pattern(/^(\+94|0)[0-9]{9}$/)
      .optional(),
  }).optional(),
});

// Location schema
const locationSchema = Joi.object({
  current: Joi.object({
    coordinates: coordinatesSchema.optional(),
    address: Joi.string().optional(),
    lastUpdated: Joi.date().optional(),
    speed: Joi.number().min(0).max(120).optional().messages({
      "number.min": "Speed cannot be negative",
      "number.max": "Maximum speed is 120 km/h",
    }),
    heading: Joi.number().min(0).max(359).optional().messages({
      "number.min": "Heading must be between 0-359 degrees",
      "number.max": "Heading must be between 0-359 degrees",
    }),
  }).optional(),
  depot: Joi.object({
    name: Joi.string().trim().optional(),
    coordinates: coordinatesSchema.optional(),
    address: Joi.string().optional(),
  }).optional(),
});

// Maintenance record schema
const maintenanceRecordSchema = Joi.object({
  date: Joi.date().default(Date.now),
  type: Joi.string()
    .valid(...maintenanceTypes)
    .required(),
  description: Joi.string().max(500).required().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  cost: Joi.number().min(0).optional().messages({
    "number.min": "Cost cannot be negative",
  }),
  performedBy: Joi.string().optional(),
  mileageAtService: Joi.number().min(0).optional().messages({
    "number.min": "Mileage cannot be negative",
  }),
});

// Maintenance schema
const maintenanceSchema = Joi.object({
  lastService: Joi.date().optional(),
  nextServiceDue: Joi.date().optional(),
  serviceIntervalKm: Joi.number().min(5000).default(10000).messages({
    "number.min": "Minimum service interval is 5,000 km",
  }),
  currentMileage: Joi.number().min(0).default(0).messages({
    "number.min": "Mileage cannot be negative",
  }),
  fitnessExpiry: Joi.date().min("now").required().messages({
    "date.min": "Fitness certificate cannot be expired",
  }),
  insuranceExpiry: Joi.date().min("now").required().messages({
    "date.min": "Insurance cannot be expired",
  }),
  emissionTestExpiry: Joi.date().optional(),
  maintenanceRecords: Joi.array().items(maintenanceRecordSchema).optional(),
});

// Violation schema
const violationSchema = Joi.object({
  date: Joi.date().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  fine: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid(...violationStatuses)
    .default("pending"),
});

// Compliance schema
const complianceSchema = Joi.object({
  routePermitExpiry: Joi.date().min("now").required().messages({
    "date.min": "Route permit cannot be expired",
  }),
  revenuePermitExpiry: Joi.date().min("now").required().messages({
    "date.min": "Revenue permit cannot be expired",
  }),
  ntcRegistrationExpiry: Joi.date().optional(),
  lastInspection: Joi.date().optional(),
  nextInspectionDue: Joi.date().optional(),
  violations: Joi.array().items(violationSchema).optional(),
});

// Bus creation validation
const createBusSchema = Joi.object({
  registrationNumber: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{2,3}-\d{4}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration number must follow Sri Lankan format (e.g., WP-1234, NC-5678)",
    }),

  permitNumber: Joi.string().trim().uppercase().required(),
  vehicleDetails: vehicleDetailsSchema.required(),
  capacity: capacitySchema.required(),
  dimensions: dimensionsSchema.required(),
  amenities: amenitiesSchema.optional(),
  operationalDetails: operationalDetailsSchema.required(),
  location: locationSchema.optional(),
  maintenance: maintenanceSchema.required(),
  compliance: complianceSchema.required(),
});

// Bus update validation
const updateBusSchema = Joi.object({
  permitNumber: Joi.string().trim().uppercase().optional(),
  vehicleDetails: vehicleDetailsSchema.optional(),
  capacity: capacitySchema.optional(),
  dimensions: dimensionsSchema.optional(),
  amenities: amenitiesSchema.optional(),
  operationalDetails: operationalDetailsSchema.optional(),
  location: locationSchema.optional(),
  maintenance: maintenanceSchema.optional(),
  compliance: complianceSchema.optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Bus status update validation
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...busStatuses)
    .required(),
  reason: Joi.string().trim().max(500).optional().messages({
    "string.max": "Reason cannot exceed 500 characters",
  }),
});

// Location update validation
const updateLocationSchema = Joi.object({
  coordinates: coordinatesSchema.required(),
  address: Joi.string().optional(),
  speed: Joi.number().min(0).max(120).optional(),
  heading: Joi.number().min(0).max(359).optional(),
});

// Query validation for bus listing
const busQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  // Filter options
  status: Joi.string()
    .valid(...busStatuses)
    .optional(),
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),

  // Search options
  search: Joi.string().trim().min(1).optional(),
  registrationNumber: Joi.string().trim().optional(),
  make: Joi.string().trim().optional(),
  model: Joi.string().trim().optional(),

  // Capacity filters
  minSeats: Joi.number().integer().min(10).optional(),
  maxSeats: Joi.number().integer().max(80).optional(),

  // Amenities filter
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

  // Vehicle filters
  fuelType: Joi.string()
    .valid(...fuelTypes)
    .optional(),
  transmissionType: Joi.string()
    .valid(...transmissionTypes)
    .optional(),

  // Service filters
  needsService: Joi.boolean().optional(),
  expiring: Joi.boolean().optional(), // permits/certificates expiring soon

  // Sorting
  sortBy: Joi.string()
    .valid(
      "createdAt",
      "registrationNumber",
      "vehicleDetails.year",
      "capacity.totalSeats",
      "maintenance.currentMileage"
    )
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Bus search validation
const busSearchSchema = Joi.object({
  location: Joi.alternatives()
    .try(Joi.string().trim(), coordinatesSchema)
    .optional(),
  radius: Joi.number().min(1).max(100).default(50).optional().messages({
    "number.min": "Radius must be at least 1 km",
    "number.max": "Radius cannot exceed 100 km",
  }),
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
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
  minCapacity: Joi.number().integer().min(10).optional(),
  maxCapacity: Joi.number().integer().max(120).optional(),
  fuelType: Joi.string()
    .valid(...fuelTypes)
    .optional(),
  status: Joi.string()
    .valid(...busStatuses)
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Maintenance record validation
const addMaintenanceRecordSchema = Joi.object({
  type: Joi.string()
    .valid(...maintenanceTypes)
    .required(),
  description: Joi.string().max(500).required(),
  cost: Joi.number().min(0).optional(),
  performedBy: Joi.string().optional(),
  mileageAtService: Joi.number().min(0).optional(),
  date: Joi.date().default(Date.now),
});

// Bulk operations validation
const bulkUpdateStatusSchema = Joi.object({
  busIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "At least one bus ID is required",
      "array.max": "Cannot update more than 50 buses at once",
      "string.pattern.base": "Invalid bus ID format",
    }),
  status: Joi.string()
    .valid(...busStatuses)
    .required(),
  reason: Joi.string().trim().max(500).optional(),
});

// Assignment validation
const assignRouteSchema = Joi.object({
  routeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid route ID format",
    }),
  effectiveDate: Joi.date().min("now").optional(),
});

const unassignRouteSchema = Joi.object({
  reason: Joi.string().trim().max(500).optional(),
});

// Fleet statistics validation
const fleetStatsSchema = Joi.object({
  operator: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  route: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional(),
});

// Violation record validation
const addViolationSchema = Joi.object({
  date: Joi.date().max("now").required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  fine: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid(...violationStatuses)
    .default("pending"),
});

// Driver/conductor assignment validation
const assignPersonnelSchema = Joi.object({
  driver: Joi.object({
    name: Joi.string().trim().max(100).required(),
    licenseNumber: Joi.string().trim().uppercase().required(),
    contactNumber: Joi.string()
      .pattern(/^(\+94|0)[0-9]{9}$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid Sri Lankan phone number",
      }),
  }).optional(),
  conductor: Joi.object({
    name: Joi.string().trim().max(100).required(),
    contactNumber: Joi.string()
      .pattern(/^(\+94|0)[0-9]{9}$/)
      .required(),
  }).optional(),
})
  .or("driver", "conductor")
  .messages({
    "object.missing": "Either driver or conductor information must be provided",
  });

// GPS tracking validation
const trackingDataSchema = Joi.object({
  coordinates: coordinatesSchema.required(),
  speed: Joi.number().min(0).max(120).required(),
  heading: Joi.number().min(0).max(359).required(),
  timestamp: Joi.date().default(Date.now),
  accuracy: Joi.number().min(0).optional(), // GPS accuracy in meters
  altitude: Joi.number().optional(),
});

module.exports = {
  createBusSchema,
  updateBusSchema,
  updateStatusSchema,
  updateLocationSchema,
  busQuerySchema,
  busSearchSchema,
  addMaintenanceRecordSchema,
  bulkUpdateStatusSchema,
  assignRouteSchema,
  unassignRouteSchema,
  fleetStatsSchema,
  addViolationSchema,
  assignPersonnelSchema,
  trackingDataSchema,
};
