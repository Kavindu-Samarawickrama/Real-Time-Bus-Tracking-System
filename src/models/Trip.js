// src/models/Trip.js
const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: [true, "Trip number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^TRP-\d{8}-\d{3}$/,
        "Trip number must follow format TRP-YYYYMMDD-XXX",
      ],
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route is required"],
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "Bus is required"],
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Operator is required"],
    },
    schedule: {
      scheduledDeparture: {
        type: Date,
        required: [true, "Scheduled departure time is required"],
      },
      scheduledArrival: {
        type: Date,
        required: [true, "Scheduled arrival time is required"],
      },
      estimatedDeparture: Date,
      estimatedArrival: Date,
      actualDeparture: Date,
      actualArrival: Date,
    },
    crew: {
      driver: {
        name: {
          type: String,
          required: [true, "Driver name is required"],
          trim: true,
          maxlength: [100, "Driver name cannot exceed 100 characters"],
        },
        licenseNumber: {
          type: String,
          required: [true, "Driver license number is required"],
          trim: true,
          uppercase: true,
        },
        contactNumber: {
          type: String,
          required: [true, "Driver contact number is required"],
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
    capacity: {
      totalSeats: {
        type: Number,
        required: [true, "Total seats capacity is required"],
        min: [10, "Minimum capacity is 10 seats"],
      },
      bookedSeats: {
        type: Number,
        default: 0,
        min: [0, "Booked seats cannot be negative"],
      },
      availableSeats: {
        type: Number,
        default: function () {
          return this.capacity.totalSeats;
        },
      },
      standingPassengers: {
        type: Number,
        default: 0,
        min: [0, "Standing passengers cannot be negative"],
      },
    },
    status: {
      type: String,
      enum: {
        values: [
          "scheduled",
          "boarding",
          "departed",
          "in_transit",
          "delayed",
          "arrived",
          "completed",
          "cancelled",
        ],
        message: "Invalid trip status",
      },
      default: "scheduled",
    },
    tracking: {
      currentLocation: {
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
      },
      speed: {
        type: Number,
        min: [0, "Speed cannot be negative"],
        max: [120, "Maximum speed is 120 km/h"],
      },
      heading: {
        type: Number,
        min: [0, "Heading must be between 0-359 degrees"],
        max: [359, "Heading must be between 0-359 degrees"],
      },
      distanceFromOrigin: {
        type: Number, // in kilometers
        default: 0,
        min: [0, "Distance cannot be negative"],
      },
      distanceToDestination: {
        type: Number, // in kilometers
        min: [0, "Distance cannot be negative"],
      },
      nextWaypoint: {
        name: String,
        estimatedArrival: Date,
        distanceAway: Number, // in kilometers
      },
    },
    waypoints: [
      {
        waypointRef: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        scheduledArrival: {
          type: Date,
          required: true,
        },
        scheduledDeparture: {
          type: Date,
          required: true,
        },
        estimatedArrival: Date,
        estimatedDeparture: Date,
        actualArrival: Date,
        actualDeparture: Date,
        status: {
          type: String,
          enum: ["pending", "approaching", "arrived", "departed", "skipped"],
          default: "pending",
        },
        passengerActivity: {
          boarded: { type: Number, default: 0 },
          alighted: { type: Number, default: 0 },
        },
      },
    ],
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
      discounts: [
        {
          type: {
            type: String,
            enum: ["student", "senior", "disabled", "promotional"],
            required: true,
          },
          percentage: {
            type: Number,
            min: [0, "Discount cannot be negative"],
            max: [100, "Discount cannot exceed 100%"],
          },
          amount: {
            type: Number,
            min: [0, "Discount amount cannot be negative"],
          },
        },
      ],
    },
    revenue: {
      totalRevenue: { type: Number, default: 0 },
      ticketsSold: { type: Number, default: 0 },
      averageFare: { type: Number, default: 0 },
      expenses: {
        fuel: { type: Number, default: 0 },
        toll: { type: Number, default: 0 },
        maintenance: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
    },
    weather: {
      conditions: {
        type: String,
        enum: ["clear", "cloudy", "rainy", "stormy", "foggy"],
      },
      temperature: Number, // in Celsius
      visibility: Number, // in kilometers
    },
    incidents: [
      {
        timestamp: {
          type: Date,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "breakdown",
            "accident",
            "traffic_jam",
            "road_closure",
            "passenger_incident",
            "fuel_shortage",
            "other",
          ],
          required: true,
        },
        description: {
          type: String,
          required: true,
          maxlength: [500, "Description cannot exceed 500 characters"],
        },
        location: {
          coordinates: {
            latitude: Number,
            longitude: Number,
          },
          address: String,
        },
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
        resolved: {
          type: Boolean,
          default: false,
        },
        resolvedAt: Date,
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    notifications: {
      passengerAlerts: [
        {
          type: {
            type: String,
            enum: [
              "delay",
              "route_change",
              "cancellation",
              "boarding",
              "arrival",
            ],
            required: true,
          },
          message: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          sent: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    ratings: {
      overall: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
      driverBehavior: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      totalRatings: { type: Number, default: 0 },
      reviews: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          rating: { type: Number, min: 1, max: 5, required: true },
          comment: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
    metadata: {
      tripType: {
        type: String,
        enum: ["regular", "express", "luxury", "special"],
        default: "regular",
      },
      repeatPattern: {
        type: String,
        enum: ["one_time", "daily", "weekly", "monthly"],
        default: "one_time",
      },
      parentTrip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip", // For recurring trips
      },
      tags: [String], // For categorization and filtering
      priority: {
        type: String,
        enum: ["low", "normal", "high", "urgent"],
        default: "normal",
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
// tripSchema.index({ tripNumber: 1 });
tripSchema.index({ route: 1, "schedule.scheduledDeparture": 1 });
tripSchema.index({ bus: 1, status: 1 });
tripSchema.index({ operator: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ "schedule.scheduledDeparture": 1 });
tripSchema.index({ "tracking.currentLocation.coordinates": "2dsphere" });
tripSchema.index({ createdAt: -1 });

// Virtual for trip duration
tripSchema.virtual("duration").get(function () {
  if (this.schedule.actualDeparture && this.schedule.actualArrival) {
    return Math.round(
      (this.schedule.actualArrival - this.schedule.actualDeparture) /
        (1000 * 60)
    ); // in minutes
  }
  if (this.schedule.scheduledDeparture && this.schedule.scheduledArrival) {
    return Math.round(
      (this.schedule.scheduledArrival - this.schedule.scheduledDeparture) /
        (1000 * 60)
    );
  }
  return null;
});

// Virtual for occupancy percentage
tripSchema.virtual("occupancyPercentage").get(function () {
  const totalPassengers =
    this.capacity.bookedSeats + this.capacity.standingPassengers;
  const totalCapacity = this.capacity.totalSeats + 20; // Assuming 20 standing capacity
  return Math.round((totalPassengers / totalCapacity) * 100);
});

// Virtual for delay calculation
tripSchema.virtual("delay").get(function () {
  const scheduled = this.schedule.scheduledDeparture;
  const actual =
    this.schedule.actualDeparture || this.schedule.estimatedDeparture;

  if (scheduled && actual) {
    return Math.round((actual - scheduled) / (1000 * 60)); // in minutes
  }
  return 0;
});

// Virtual for trip progress percentage
tripSchema.virtual("progressPercentage").get(function () {
  if (!this.tracking.distanceFromOrigin || !this.route) return 0;

  // This would be calculated based on route distance
  // For now, using a simple calculation
  const totalDistance =
    this.tracking.distanceFromOrigin +
    (this.tracking.distanceToDestination || 0);
  if (totalDistance === 0) return 0;

  return Math.round((this.tracking.distanceFromOrigin / totalDistance) * 100);
});

// Pre-save middleware to generate trip number
tripSchema.pre("save", function (next) {
  if (this.isNew && !this.tripNumber) {
    const date = new Date(this.schedule.scheduledDeparture);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 900) + 100;
    this.tripNumber = `TRP-${dateStr}-${randomNum}`;
  }
  next();
});

// Pre-save middleware to update available seats
tripSchema.pre("save", function (next) {
  if (this.isModified("capacity.bookedSeats")) {
    this.capacity.availableSeats =
      this.capacity.totalSeats - this.capacity.bookedSeats;
  }
  next();
});

// Pre-save middleware to calculate revenue
tripSchema.pre("save", function (next) {
  if (
    this.isModified("capacity.bookedSeats") ||
    this.isModified("fare.baseFare")
  ) {
    this.revenue.averageFare = this.fare.baseFare;
    this.revenue.totalRevenue = this.capacity.bookedSeats * this.fare.baseFare;
    this.revenue.ticketsSold = this.capacity.bookedSeats;
  }
  next();
});

// Instance method to update location
tripSchema.methods.updateLocation = function (locationData) {
  this.tracking.currentLocation = {
    coordinates: locationData.coordinates,
    address: locationData.address,
    lastUpdated: new Date(),
  };
  this.tracking.speed = locationData.speed;
  this.tracking.heading = locationData.heading;

  // Update distances (would be calculated using route geometry)
  if (locationData.distanceFromOrigin !== undefined) {
    this.tracking.distanceFromOrigin = locationData.distanceFromOrigin;
  }
  if (locationData.distanceToDestination !== undefined) {
    this.tracking.distanceToDestination = locationData.distanceToDestination;
  }

  return this.save();
};

// Instance method to update trip status
tripSchema.methods.updateStatus = function (newStatus, updateData = {}) {
  const now = new Date();
  this.status = newStatus;

  switch (newStatus) {
    case "boarding":
      this.schedule.estimatedDeparture =
        updateData.estimatedDeparture || new Date(now.getTime() + 15 * 60000); // 15 mins
      break;
    case "departed":
      this.schedule.actualDeparture = updateData.actualDeparture || now;
      break;
    case "arrived":
      this.schedule.actualArrival = updateData.actualArrival || now;
      break;
    case "completed":
      if (!this.schedule.actualArrival) {
        this.schedule.actualArrival = now;
      }
      break;
  }

  return this.save();
};

// Instance method to add incident
tripSchema.methods.addIncident = function (incidentData) {
  this.incidents.push({
    ...incidentData,
    timestamp: incidentData.timestamp || new Date(),
  });
  return this.save();
};

// Instance method to check if trip is delayed
tripSchema.methods.isDelayed = function (thresholdMinutes = 15) {
  return this.delay > thresholdMinutes;
};

// Static method to find active trips
tripSchema.statics.findActiveTrips = function () {
  return this.find({
    status: { $in: ["boarding", "departed", "in_transit"] },
  }).populate("route bus operator");
};

// Static method to find trips by operator
tripSchema.statics.findByOperator = function (operatorId, status = null) {
  const query = { operator: operatorId };
  if (status) query.status = status;

  return this.find(query)
    .populate("route", "routeNumber routeName origin.city destination.city")
    .populate(
      "bus",
      "registrationNumber vehicleDetails.make vehicleDetails.model"
    );
};

// Static method to find trips by route
tripSchema.statics.findByRoute = function (
  routeId,
  dateFrom = null,
  dateTo = null
) {
  const query = { route: routeId };

  if (dateFrom || dateTo) {
    query["schedule.scheduledDeparture"] = {};
    if (dateFrom) query["schedule.scheduledDeparture"].$gte = dateFrom;
    if (dateTo) query["schedule.scheduledDeparture"].$lte = dateTo;
  }

  return this.find(query)
    .populate(
      "bus",
      "registrationNumber vehicleDetails.make vehicleDetails.model"
    )
    .populate(
      "operator",
      "profile.firstName profile.lastName organizationDetails.companyName"
    );
};

// Static method to find delayed trips
tripSchema.statics.findDelayedTrips = function (thresholdMinutes = 15) {
  const now = new Date();
  return this.find({
    status: { $in: ["scheduled", "boarding", "departed", "in_transit"] },
    $or: [
      {
        "schedule.actualDeparture": { $exists: true },
        $expr: {
          $gt: [
            {
              $subtract: [
                "$schedule.actualDeparture",
                "$schedule.scheduledDeparture",
              ],
            },
            thresholdMinutes * 60 * 1000,
          ],
        },
      },
      {
        status: "scheduled",
        "schedule.scheduledDeparture": {
          $lt: new Date(now.getTime() - thresholdMinutes * 60 * 1000),
        },
      },
    ],
  });
};

module.exports = mongoose.model("Trip", tripSchema);
