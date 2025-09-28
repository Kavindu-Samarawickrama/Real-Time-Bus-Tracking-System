// src/models/Bus.js
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Bus registration number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z]{2,3}-\d{4}$/,
        "Registration number must follow Sri Lankan format (e.g., WP-1234, NC-5678)",
      ],
    },
    permitNumber: {
      type: String,
      required: [true, "Route permit number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleDetails: {
      make: {
        type: String,
        required: [true, "Vehicle make is required"],
        trim: true,
        maxlength: [50, "Make cannot exceed 50 characters"],
      },
      model: {
        type: String,
        required: [true, "Vehicle model is required"],
        trim: true,
        maxlength: [50, "Model cannot exceed 50 characters"],
      },
      year: {
        type: Number,
        required: [true, "Manufacturing year is required"],
        min: [1980, "Year must be 1980 or later"],
        max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
      },
      engineNumber: {
        type: String,
        required: [true, "Engine number is required"],
        trim: true,
        uppercase: true,
      },
      chassisNumber: {
        type: String,
        required: [true, "Chassis number is required"],
        trim: true,
        uppercase: true,
      },
      fuelType: {
        type: String,
        enum: {
          values: ["diesel", "petrol", "cng", "electric", "hybrid"],
          message: "Fuel type must be diesel, petrol, CNG, electric, or hybrid",
        },
        default: "diesel",
      },
      transmissionType: {
        type: String,
        enum: {
          values: ["manual", "automatic", "semi_automatic"],
          message:
            "Transmission type must be manual, automatic, or semi_automatic",
        },
        default: "manual",
      },
    },
    capacity: {
      totalSeats: {
        type: Number,
        required: [true, "Total seat capacity is required"],
        min: [10, "Minimum capacity is 10 seats"],
        max: [80, "Maximum capacity is 80 seats"],
      },
      standingCapacity: {
        type: Number,
        default: 0,
        min: [0, "Standing capacity cannot be negative"],
        max: [40, "Maximum standing capacity is 40"],
      },
      wheelchairAccessible: {
        type: Number,
        default: 0,
        min: [0, "Wheelchair accessible seats cannot be negative"],
        max: [4, "Maximum wheelchair accessible seats is 4"],
      },
    },
    dimensions: {
      length: {
        type: Number, // in meters
        required: [true, "Bus length is required"],
        min: [6, "Minimum length is 6 meters"],
        max: [18, "Maximum length is 18 meters"],
      },
      width: {
        type: Number, // in meters
        required: [true, "Bus width is required"],
        min: [2, "Minimum width is 2 meters"],
        max: [2.8, "Maximum width is 2.8 meters"],
      },
      height: {
        type: Number, // in meters
        required: [true, "Bus height is required"],
        min: [2.5, "Minimum height is 2.5 meters"],
        max: [4.2, "Maximum height is 4.2 meters"],
      },
    },
    amenities: {
      airConditioning: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      chargingPorts: { type: Boolean, default: false },
      entertainment: { type: Boolean, default: false },
      restroom: { type: Boolean, default: false },
      recliningSeats: { type: Boolean, default: false },
      luggageCompartment: { type: Boolean, default: true },
      firstAidKit: { type: Boolean, default: true },
      fireExtinguisher: { type: Boolean, default: true },
      gpsTracking: { type: Boolean, default: true },
      cctv: { type: Boolean, default: false },
    },
    operationalDetails: {
      operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Bus operator is required"],
      },
      assignedRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        default: null,
      },
      currentDriver: {
        name: {
          type: String,
          trim: true,
          maxlength: [100, "Driver name cannot exceed 100 characters"],
        },
        licenseNumber: {
          type: String,
          trim: true,
          uppercase: true,
        },
        contactNumber: {
          type: String,
          match: [
            /^(\+94|0)[0-9]{9}$/,
            "Please enter a valid Sri Lankan phone number",
          ],
        },
      },
      conductor: {
        name: {
          type: String,
          trim: true,
          maxlength: [100, "Conductor name cannot exceed 100 characters"],
        },
        contactNumber: {
          type: String,
          match: [
            /^(\+94|0)[0-9]{9}$/,
            "Please enter a valid Sri Lankan phone number",
          ],
        },
      },
    },
    status: {
      type: String,
      enum: {
        values: [
          "active",
          "inactive",
          "maintenance",
          "out_of_service",
          "pending_approval",
        ],
        message:
          "Status must be active, inactive, maintenance, out_of_service, or pending_approval",
      },
      default: "pending_approval",
    },
    location: {
      current: {
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
        address: String,
        lastUpdated: Date,
        speed: {
          type: Number, // km/h
          min: [0, "Speed cannot be negative"],
          max: [120, "Maximum speed is 120 km/h"],
        },
        heading: {
          type: Number, // degrees (0-359)
          min: [0, "Heading must be between 0-359 degrees"],
          max: [359, "Heading must be between 0-359 degrees"],
        },
      },
      depot: {
        name: {
          type: String,
          trim: true,
        },
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
        address: String,
      },
    },
    maintenance: {
      lastService: Date,
      nextServiceDue: Date,
      serviceIntervalKm: {
        type: Number,
        default: 10000, // 10,000 km intervals
        min: [5000, "Minimum service interval is 5,000 km"],
      },
      currentMileage: {
        type: Number,
        default: 0,
        min: [0, "Mileage cannot be negative"],
      },
      fitnessExpiry: {
        type: Date,
        required: [true, "Fitness certificate expiry date is required"],
      },
      insuranceExpiry: {
        type: Date,
        required: [true, "Insurance expiry date is required"],
      },
      emissionTestExpiry: Date,
      maintenanceRecords: [
        {
          date: {
            type: Date,
            required: true,
          },
          type: {
            type: String,
            enum: ["routine", "repair", "inspection", "emergency"],
            required: true,
          },
          description: {
            type: String,
            required: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
          },
          cost: {
            type: Number,
            min: [0, "Cost cannot be negative"],
          },
          performedBy: String,
          mileageAtService: Number,
        },
      ],
    },
    compliance: {
      routePermitExpiry: {
        type: Date,
        required: [true, "Route permit expiry date is required"],
      },
      revenuePermitExpiry: {
        type: Date,
        required: [true, "Revenue permit expiry date is required"],
      },
      ntcRegistrationExpiry: Date,
      lastInspection: Date,
      nextInspectionDue: Date,
      violations: [
        {
          date: Date,
          type: String,
          description: String,
          fine: Number,
          status: {
            type: String,
            enum: ["pending", "paid", "disputed", "waived"],
            default: "pending",
          },
        },
      ],
    },
    statistics: {
      totalTrips: { type: Number, default: 0 },
      totalKilometers: { type: Number, default: 0 },
      averageSpeed: { type: Number, default: 0 },
      fuelEfficiency: { type: Number, default: 0 }, // km per liter
      lastTripDate: Date,
      monthlyRevenue: { type: Number, default: 0 },
      passengerCount: { type: Number, default: 0 },
      rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
      },
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
    },
  }
);

// Indexes for better performance
// busSchema.index({ registrationNumber: 1 });
// busSchema.index({ permitNumber: 1 });
busSchema.index({ "operationalDetails.operator": 1 });
busSchema.index({ "operationalDetails.assignedRoute": 1 });
busSchema.index({ status: 1 });
busSchema.index({ "location.current.coordinates": "2dsphere" });
busSchema.index({ createdAt: -1 });
busSchema.index({ "maintenance.nextServiceDue": 1 });
busSchema.index({ "compliance.routePermitExpiry": 1 });

// Virtual for total capacity
busSchema.virtual("totalCapacity").get(function () {
  return this.capacity.totalSeats + this.capacity.standingCapacity;
});

// Virtual for service due status
busSchema.virtual("serviceDueStatus").get(function () {
  if (!this.maintenance.nextServiceDue) return "unknown";

  const today = new Date();
  const dueDate = new Date(this.maintenance.nextServiceDue);
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 7) return "due_soon";
  return "current";
});

// Virtual for compliance status
busSchema.virtual("complianceStatus").get(function () {
  const today = new Date();
  const permits = [
    this.compliance.routePermitExpiry,
    this.compliance.revenuePermitExpiry,
    this.maintenance.fitnessExpiry,
    this.maintenance.insuranceExpiry,
  ];

  const expiringSoon = permits.some((date) => {
    if (!date) return true;
    const daysUntilExpiry = Math.ceil(
      (new Date(date) - today) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30;
  });

  const expired = permits.some((date) => {
    if (!date) return true;
    return new Date(date) < today;
  });

  if (expired) return "expired";
  if (expiringSoon) return "expiring_soon";
  return "compliant";
});

// Pre-save middleware to update next service due date
busSchema.pre("save", function (next) {
  if (
    this.isModified("maintenance.lastService") &&
    this.maintenance.lastService
  ) {
    const nextDue = new Date(this.maintenance.lastService);
    nextDue.setDate(nextDue.getDate() + 180); // 6 months
    this.maintenance.nextServiceDue = nextDue;
  }
  next();
});

// Pre-save middleware to calculate next inspection due
busSchema.pre("save", function (next) {
  if (
    this.isModified("compliance.lastInspection") &&
    this.compliance.lastInspection
  ) {
    const nextDue = new Date(this.compliance.lastInspection);
    nextDue.setFullYear(nextDue.getFullYear() + 1); // Annual inspection
    this.compliance.nextInspectionDue = nextDue;
  }
  next();
});

// Instance method to update location
busSchema.methods.updateLocation = function (locationData) {
  this.location.current = {
    ...this.location.current,
    ...locationData,
    lastUpdated: new Date(),
  };
  return this.save();
};

// Instance method to add maintenance record
busSchema.methods.addMaintenanceRecord = function (record) {
  this.maintenance.maintenanceRecords.push({
    ...record,
    date: record.date || new Date(),
  });

  if (record.type === "routine") {
    this.maintenance.lastService = record.date || new Date();
    if (record.mileageAtService) {
      this.maintenance.currentMileage = record.mileageAtService;
    }
  }

  return this.save();
};

// Instance method to check if bus needs service
busSchema.methods.needsService = function () {
  if (!this.maintenance.nextServiceDue) return true;

  const today = new Date();
  const daysUntilDue = Math.ceil(
    (this.maintenance.nextServiceDue - today) / (1000 * 60 * 60 * 24)
  );
  const kmSinceService =
    this.maintenance.currentMileage -
    (this.maintenance.lastServiceMileage || 0);

  return (
    daysUntilDue <= 7 || kmSinceService >= this.maintenance.serviceIntervalKm
  );
};

// Static method to find buses by operator
busSchema.statics.findByOperator = function (operatorId, status = null) {
  const query = { "operationalDetails.operator": operatorId };
  if (status) query.status = status;

  return this.find(query)
    .populate(
      "operationalDetails.operator",
      "profile.firstName profile.lastName organizationDetails.companyName"
    )
    .populate(
      "operationalDetails.assignedRoute",
      "routeNumber routeName origin.city destination.city"
    );
};

// Static method to find buses by route
busSchema.statics.findByRoute = function (routeId, status = "active") {
  return this.find({
    "operationalDetails.assignedRoute": routeId,
    status: status,
  }).populate(
    "operationalDetails.operator",
    "profile.firstName profile.lastName organizationDetails.companyName"
  );
};

// Static method to find buses needing service
busSchema.statics.findNeedingService = function () {
  const today = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(today.getDate() + 7);

  return this.find({
    $or: [
      { "maintenance.nextServiceDue": { $lte: weekFromNow } },
      { "maintenance.nextServiceDue": { $exists: false } },
      { "maintenance.nextServiceDue": null },
    ],
    status: { $in: ["active", "inactive"] },
  });
};

// Static method to find buses with expiring permits
busSchema.statics.findWithExpiringPermits = function (days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.find({
    $or: [
      { "compliance.routePermitExpiry": { $lte: futureDate, $gte: today } },
      { "compliance.revenuePermitExpiry": { $lte: futureDate, $gte: today } },
      { "maintenance.fitnessExpiry": { $lte: futureDate, $gte: today } },
      { "maintenance.insuranceExpiry": { $lte: futureDate, $gte: today } },
    ],
  });
};

module.exports = mongoose.model("Bus", busSchema);
