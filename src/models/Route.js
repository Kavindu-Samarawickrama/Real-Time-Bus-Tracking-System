// src/models/Route.js
const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: [true, "Route number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z0-9-]+$/,
        "Route number can only contain letters, numbers, and hyphens",
      ],
    },
    routeName: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
      maxlength: [100, "Route name cannot exceed 100 characters"],
    },
    origin: {
      city: {
        type: String,
        required: [true, "Origin city is required"],
        trim: true,
      },
      province: {
        type: String,
        required: [true, "Origin province is required"],
        enum: [
          "Western",
          "Central",
          "Southern",
          "Northern",
          "Eastern",
          "North Western",
          "North Central",
          "Uva",
          "Sabaragamuwa",
        ],
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
          min: [5.9, "Latitude must be within Sri Lanka bounds"],
          max: [9.9, "Latitude must be within Sri Lanka bounds"],
        },
        longitude: {
          type: Number,
          required: true,
          min: [79.6, "Longitude must be within Sri Lanka bounds"],
          max: [81.9, "Longitude must be within Sri Lanka bounds"],
        },
      },
      terminalName: String,
    },
    destination: {
      city: {
        type: String,
        required: [true, "Destination city is required"],
        trim: true,
      },
      province: {
        type: String,
        required: [true, "Destination province is required"],
        enum: [
          "Western",
          "Central",
          "Southern",
          "Northern",
          "Eastern",
          "North Western",
          "North Central",
          "Uva",
          "Sabaragamuwa",
        ],
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
          min: [5.9, "Latitude must be within Sri Lanka bounds"],
          max: [9.9, "Latitude must be within Sri Lanka bounds"],
        },
        longitude: {
          type: Number,
          required: true,
          min: [79.6, "Longitude must be within Sri Lanka bounds"],
          max: [81.9, "Longitude must be within Sri Lanka bounds"],
        },
      },
      terminalName: String,
    },
    waypoints: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        city: String,
        coordinates: {
          latitude: {
            type: Number,
            required: true,
            min: [5.9, "Latitude must be within Sri Lanka bounds"],
            max: [9.9, "Latitude must be within Sri Lanka bounds"],
          },
          longitude: {
            type: Number,
            required: true,
            min: [79.6, "Longitude must be within Sri Lanka bounds"],
            max: [81.9, "Longitude must be within Sri Lanka bounds"],
          },
        },
        estimatedTravelTime: {
          type: Number, // minutes from origin
          required: true,
          min: [0, "Travel time cannot be negative"],
        },
        stopOrder: {
          type: Number,
          required: true,
          min: [1, "Stop order must be at least 1"],
        },
        stopDuration: {
          type: Number, // minutes
          default: 5,
          min: [0, "Stop duration cannot be negative"],
        },
      },
    ],
    distance: {
      type: Number, // in kilometers
      required: [true, "Route distance is required"],
      min: [1, "Distance must be at least 1 km"],
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: [true, "Estimated duration is required"],
      min: [10, "Duration must be at least 10 minutes"],
    },
    operatingHours: {
      firstDeparture: {
        type: String,
        required: [true, "First departure time is required"],
        match: [
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Invalid time format. Use HH:MM",
        ],
      },
      lastDeparture: {
        type: String,
        required: [true, "Last departure time is required"],
        match: [
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Invalid time format. Use HH:MM",
        ],
      },
      frequency: {
        type: Number, // minutes between departures
        required: [true, "Departure frequency is required"],
        min: [15, "Minimum frequency is 15 minutes"],
        max: [480, "Maximum frequency is 8 hours"],
      },
    },
    routeType: {
      type: String,
      enum: {
        values: ["express", "semi_express", "normal", "luxury"],
        message: "Route type must be express, semi_express, normal, or luxury",
      },
      default: "normal",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended", "maintenance"],
        message: "Status must be active, inactive, suspended, or maintenance",
      },
      default: "active",
    },
    operatedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fare: {
      baseFare: {
        type: Number,
        required: [true, "Base fare is required"],
        min: [0, "Fare cannot be negative"],
      },
      currency: {
        type: String,
        default: "LKR",
        enum: ["LKR"],
      },
    },
    amenities: {
      airConditioned: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      chargingPorts: { type: Boolean, default: false },
      restroom: { type: Boolean, default: false },
      entertainment: { type: Boolean, default: false },
    },
    weeklySchedule: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true },
    },
    statistics: {
      totalTrips: { type: Number, default: 0 },
      totalBuses: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      lastActiveDate: Date,
    },
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
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ "origin.province": 1, "destination.province": 1 });
routeSchema.index({ "origin.city": 1, "destination.city": 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ routeType: 1 });
routeSchema.index({ operatedBy: 1 });
routeSchema.index({ createdAt: -1 });

// Compound index for location-based queries
routeSchema.index({
  "origin.coordinates": "2dsphere",
  "destination.coordinates": "2dsphere",
});

// Virtual for route summary
routeSchema.virtual("routeSummary").get(function () {
  return `${this.origin.city} to ${this.destination.city} (${this.routeNumber})`;
});

// Virtual for inter-provincial check
routeSchema.virtual("isInterProvincial").get(function () {
  return this.origin.province !== this.destination.province;
});

// Pre-save middleware to validate waypoints order
routeSchema.pre("save", function (next) {
  if (this.waypoints && this.waypoints.length > 0) {
    // Sort waypoints by stopOrder
    this.waypoints.sort((a, b) => a.stopOrder - b.stopOrder);

    // Validate sequential order
    for (let i = 0; i < this.waypoints.length; i++) {
      if (this.waypoints[i].stopOrder !== i + 1) {
        return next(
          new Error("Waypoint stop orders must be sequential starting from 1")
        );
      }
    }
  }
  next();
});

// Pre-save middleware to update statistics
routeSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "active") {
    this.statistics.lastActiveDate = new Date();
  }
  next();
});

// Instance method to calculate total journey time including stops
routeSchema.methods.calculateTotalJourneyTime = function () {
  let totalTime = this.estimatedDuration;
  if (this.waypoints && this.waypoints.length > 0) {
    const totalStopTime = this.waypoints.reduce((sum, waypoint) => {
      return sum + (waypoint.stopDuration || 5);
    }, 0);
    totalTime += totalStopTime;
  }
  return totalTime;
};

// Instance method to get next departure time
routeSchema.methods.getNextDeparture = function (currentTime = new Date()) {
  const now = currentTime;
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const [firstHour, firstMinute] = this.operatingHours.firstDeparture
    .split(":")
    .map(Number);
  const [lastHour, lastMinute] = this.operatingHours.lastDeparture
    .split(":")
    .map(Number);

  const firstDepartureInMinutes = firstHour * 60 + firstMinute;
  const lastDepartureInMinutes = lastHour * 60 + lastMinute;

  // If current time is before first departure
  if (currentTimeInMinutes < firstDepartureInMinutes) {
    return this.operatingHours.firstDeparture;
  }

  // If current time is after last departure
  if (currentTimeInMinutes > lastDepartureInMinutes) {
    return null; // No more departures today
  }

  // Find next departure based on frequency
  let nextDepartureInMinutes = firstDepartureInMinutes;
  while (nextDepartureInMinutes <= currentTimeInMinutes) {
    nextDepartureInMinutes += this.operatingHours.frequency;
  }

  // If next departure is after last departure
  if (nextDepartureInMinutes > lastDepartureInMinutes) {
    return null;
  }

  const nextHour = Math.floor(nextDepartureInMinutes / 60);
  const nextMinute = nextDepartureInMinutes % 60;

  return `${nextHour.toString().padStart(2, "0")}:${nextMinute
    .toString()
    .padStart(2, "0")}`;
};

// Static method to find routes between cities
routeSchema.statics.findRoutesBetweenCities = function (
  originCity,
  destinationCity,
  status = "active"
) {
  return this.find({
    "origin.city": new RegExp(originCity, "i"),
    "destination.city": new RegExp(destinationCity, "i"),
    status: status,
  }).populate(
    "operatedBy",
    "profile.firstName profile.lastName organizationDetails.companyName"
  );
};

// Static method to find routes by province
routeSchema.statics.findRoutesByProvince = function (
  province,
  status = "active"
) {
  return this.find({
    $or: [
      { "origin.province": province },
      { "destination.province": province },
    ],
    status: status,
  });
};

// Static method to find inter-provincial routes
routeSchema.statics.findInterProvincialRoutes = function (status = "active") {
  return this.find({
    $expr: { $ne: ["$origin.province", "$destination.province"] },
    status: status,
  });
};

module.exports = mongoose.model("Route", routeSchema);
