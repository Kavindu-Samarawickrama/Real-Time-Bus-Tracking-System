// src/models/Tracking.js
const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: [true, "Tracking ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^TRK-\d{8}-\d{6}$/,
        "Tracking ID must follow format TRK-YYYYMMDD-HHMMSS",
      ],
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: [true, "Trip reference is required"],
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "Bus reference is required"],
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route reference is required"],
    },
    driver: {
      name: {
        type: String,
        required: [true, "Driver name is required"],
        trim: true,
      },
      contactNumber: {
        type: String,
        required: [true, "Driver contact is required"],
        match: [/^(\+94|0)[0-9]{9}$/, "Invalid Sri Lankan phone number"],
      },
      driverId: String,
    },
    status: {
      type: String,
      enum: {
        values: [
          "active",
          "paused",
          "stopped",
          "completed",
          "emergency",
          "offline",
        ],
        message: "Invalid tracking status",
      },
      default: "active",
    },
    realTimeData: {
      currentLocation: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: [true, "Current coordinates are required"],
          validate: {
            validator: function (coords) {
              return (
                coords.length === 2 &&
                coords[1] >= 5.9 &&
                coords[1] <= 9.9 && // latitude bounds for Sri Lanka
                coords[0] >= 79.6 &&
                coords[0] <= 81.9
              ); // longitude bounds for Sri Lanka
            },
            message: "Coordinates must be within Sri Lanka bounds",
          },
        },
      },
      speed: {
        type: Number,
        default: 0,
        min: [0, "Speed cannot be negative"],
        max: [120, "Maximum speed is 120 km/h"],
      },
      heading: {
        type: Number,
        min: [0, "Heading must be between 0-359 degrees"],
        max: [359, "Heading must be between 0-359 degrees"],
      },
      altitude: {
        type: Number, // in meters
        min: [-100, "Altitude cannot be below -100m"],
        max: [3000, "Altitude cannot exceed 3000m for Sri Lanka"],
      },
      accuracy: {
        type: Number, // GPS accuracy in meters
        min: [0, "Accuracy cannot be negative"],
        default: 10,
      },
      timestamp: {
        type: Date,
        required: [true, "Location timestamp is required"],
      },
      address: {
        type: String,
        trim: true,
      },
    },
    routeProgress: {
      distanceFromOrigin: {
        type: Number, // in kilometers
        default: 0,
        min: [0, "Distance cannot be negative"],
      },
      distanceToDestination: {
        type: Number, // in kilometers
        min: [0, "Distance cannot be negative"],
      },
      completionPercentage: {
        type: Number,
        default: 0,
        min: [0, "Completion cannot be negative"],
        max: [100, "Completion cannot exceed 100%"],
      },
      estimatedArrival: {
        type: Date,
      },
      nextWaypoint: {
        name: String,
        coordinates: [Number], // [longitude, latitude]
        estimatedArrival: Date,
        distanceAway: Number, // in kilometers
      },
    },
    geofences: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["station", "terminal", "depot", "waypoint", "restricted_zone"],
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
        radius: {
          type: Number, // in meters
          required: true,
          min: [10, "Minimum geofence radius is 10 meters"],
          max: [5000, "Maximum geofence radius is 5km"],
        },
        entered: {
          type: Boolean,
          default: false,
        },
        enteredAt: Date,
        exitedAt: Date,
        alerts: {
          onEntry: { type: Boolean, default: true },
          onExit: { type: Boolean, default: true },
        },
      },
    ],
    trackingHistory: [
      {
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: [Number], // [longitude, latitude]
        },
        speed: Number,
        heading: Number,
        altitude: Number,
        accuracy: Number,
        timestamp: {
          type: Date,
          required: true,
        },
        address: String,
        distanceFromPrevious: Number, // in meters
        timeSinceLastUpdate: Number, // in seconds
      },
    ],
    alerts: [
      {
        alertId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "speed_violation",
            "route_deviation",
            "geofence_entry",
            "geofence_exit",
            "emergency_button",
            "engine_issue",
            "fuel_low",
            "maintenance_due",
            "communication_loss",
          ],
          required: true,
        },
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        location: {
          coordinates: [Number],
          address: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        acknowledged: {
          type: Boolean,
          default: false,
        },
        acknowledgedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        acknowledgedAt: Date,
        resolved: {
          type: Boolean,
          default: false,
        },
        resolvedAt: Date,
      },
    ],
    emergencyData: {
      panicButtonPressed: {
        type: Boolean,
        default: false,
      },
      lastPanicAt: Date,
      emergencyContacts: [
        {
          name: String,
          phone: String,
          relationship: String, // "police", "medical", "management"
          notified: { type: Boolean, default: false },
        },
      ],
      currentEmergency: {
        type: {
          type: String,
          enum: [
            "accident",
            "breakdown",
            "medical",
            "security",
            "fire",
            "other",
          ],
        },
        description: String,
        reportedAt: Date,
        status: {
          type: String,
          enum: ["active", "resolved", "escalated"],
        },
      },
    },
    performance: {
      averageSpeed: {
        type: Number,
        default: 0,
      },
      maxSpeed: {
        type: Number,
        default: 0,
      },
      totalDistance: {
        type: Number, // in kilometers
        default: 0,
      },
      totalDrivingTime: {
        type: Number, // in minutes
        default: 0,
      },
      fuelEfficiency: {
        type: Number, // km per liter (estimated)
        default: 0,
      },
      stopTime: {
        type: Number, // total minutes stopped
        default: 0,
      },
      routeDeviations: {
        type: Number,
        default: 0,
      },
      speedViolations: {
        type: Number,
        default: 0,
      },
    },
    connectivity: {
      lastHeartbeat: {
        type: Date,
        default: Date.now,
      },
      signalStrength: {
        type: Number, // 0-100 percentage
        min: [0, "Signal strength cannot be negative"],
        max: [100, "Signal strength cannot exceed 100%"],
      },
      deviceInfo: {
        deviceId: String,
        model: String,
        os: String,
        appVersion: String,
        batteryLevel: {
          type: Number,
          min: [0, "Battery level cannot be negative"],
          max: [100, "Battery level cannot exceed 100%"],
        },
      },
      connectionType: {
        type: String,
        enum: ["4G", "3G", "2G", "WiFi", "Offline"],
        default: "4G",
      },
      isOnline: {
        type: Boolean,
        default: true,
      },
      lastOnlineAt: Date,
    },
    settings: {
      updateInterval: {
        type: Number, // in seconds
        default: 30,
        min: [10, "Minimum update interval is 10 seconds"],
        max: [300, "Maximum update interval is 5 minutes"],
      },
      trackingAccuracy: {
        type: String,
        enum: ["high", "medium", "low", "battery_saving"],
        default: "high",
      },
      alertsEnabled: {
        type: Boolean,
        default: true,
      },
      shareLocation: {
        type: Boolean,
        default: true,
      },
    },
    metadata: {
      startTime: {
        type: Date,
        required: true,
      },
      endTime: Date,
      totalDuration: Number, // in minutes
      dataPoints: {
        type: Number,
        default: 0,
      },
      lastDataReceived: Date,
      version: {
        type: String,
        default: "1.0",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
// trackingSchema.index({ trackingId: 1 });
trackingSchema.index({ trip: 1 });
trackingSchema.index({ bus: 1 });
trackingSchema.index({ route: 1 });
trackingSchema.index({ status: 1 });
trackingSchema.index({ "realTimeData.currentLocation": "2dsphere" });
trackingSchema.index({ "realTimeData.timestamp": -1 });
trackingSchema.index({ "connectivity.lastHeartbeat": -1 });
trackingSchema.index({ "trackingHistory.timestamp": -1 });
trackingSchema.index({ "alerts.timestamp": -1 });
trackingSchema.index({ "metadata.startTime": -1 });

// Virtual for tracking duration
trackingSchema.virtual("currentDuration").get(function () {
  if (this.metadata.endTime) {
    return Math.round(
      (this.metadata.endTime - this.metadata.startTime) / (1000 * 60)
    ); // in minutes
  }
  return Math.round((new Date() - this.metadata.startTime) / (1000 * 60));
});

// Virtual for online status
trackingSchema.virtual("isCurrentlyOnline").get(function () {
  if (!this.connectivity.lastHeartbeat) return false;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.connectivity.lastHeartbeat > fiveMinutesAgo;
});

// Virtual for emergency status
trackingSchema.virtual("inEmergency").get(function () {
  return (
    this.emergencyData.panicButtonPressed ||
    (this.emergencyData.currentEmergency &&
      this.emergencyData.currentEmergency.status === "active")
  );
});

// Pre-save middleware to generate tracking ID
trackingSchema.pre("save", function (next) {
  if (this.isNew && !this.trackingId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, "");
    this.trackingId = `TRK-${dateStr}-${timeStr}`;
  }
  next();
});

// Pre-save middleware to update metadata
trackingSchema.pre("save", function (next) {
  if (this.isModified("realTimeData.timestamp")) {
    this.metadata.lastDataReceived = this.realTimeData.timestamp;
    this.metadata.dataPoints = (this.metadata.dataPoints || 0) + 1;
  }
  next();
});

// Pre-save middleware to update performance metrics
trackingSchema.pre("save", function (next) {
  if (this.isModified("realTimeData.speed")) {
    this.performance.maxSpeed = Math.max(
      this.performance.maxSpeed || 0,
      this.realTimeData.speed
    );

    // Calculate average speed (simplified)
    if (this.trackingHistory.length > 0) {
      const totalSpeed =
        this.trackingHistory.reduce(
          (sum, point) => sum + (point.speed || 0),
          0
        ) + this.realTimeData.speed;
      this.performance.averageSpeed =
        totalSpeed / (this.trackingHistory.length + 1);
    } else {
      this.performance.averageSpeed = this.realTimeData.speed;
    }
  }
  next();
});

// Instance method to update current location
trackingSchema.methods.updateLocation = function (locationData) {
  // Store previous location in history
  if (
    this.realTimeData.currentLocation &&
    this.realTimeData.currentLocation.coordinates
  ) {
    const historyEntry = {
      location: {
        type: "Point",
        coordinates: [...this.realTimeData.currentLocation.coordinates],
      },
      speed: this.realTimeData.speed,
      heading: this.realTimeData.heading,
      altitude: this.realTimeData.altitude,
      accuracy: this.realTimeData.accuracy,
      timestamp: this.realTimeData.timestamp,
      address: this.realTimeData.address,
    };

    // Calculate distance from previous point if available
    if (this.trackingHistory.length > 0) {
      const lastPoint = this.trackingHistory[this.trackingHistory.length - 1];
      const timeDiff =
        (this.realTimeData.timestamp - lastPoint.timestamp) / 1000; // seconds
      historyEntry.timeSinceLastUpdate = timeDiff;

      // Calculate distance (simplified - would use proper geospatial calculation)
      const distance = this.calculateDistance(
        lastPoint.location.coordinates[1],
        lastPoint.location.coordinates[0],
        this.realTimeData.currentLocation.coordinates[1],
        this.realTimeData.currentLocation.coordinates[0]
      );
      historyEntry.distanceFromPrevious = distance * 1000; // convert to meters

      // Update total distance
      this.performance.totalDistance += distance;
    }

    this.trackingHistory.push(historyEntry);

    // Limit history to last 1000 points to prevent document size issues
    if (this.trackingHistory.length > 1000) {
      this.trackingHistory = this.trackingHistory.slice(-1000);
    }
  }

  // Update current location
  this.realTimeData = {
    ...this.realTimeData,
    ...locationData,
    timestamp: locationData.timestamp || new Date(),
  };

  // Update connectivity
  this.connectivity.lastHeartbeat = new Date();
  this.connectivity.isOnline = true;
  this.connectivity.lastOnlineAt = new Date();

  return this.save();
};

// Instance method to calculate distance between two points (Haversine formula)
trackingSchema.methods.calculateDistance = function (lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = this.toRadians(lat2 - lat1);
  const dLon = this.toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper method to convert degrees to radians
trackingSchema.methods.toRadians = function (degrees) {
  return degrees * (Math.PI / 180);
};

// Instance method to add alert
trackingSchema.methods.addAlert = function (alertData) {
  const alertId = `ALT-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  this.alerts.push({
    alertId,
    ...alertData,
    timestamp: alertData.timestamp || new Date(),
  });

  // Update performance counters
  if (alertData.type === "speed_violation") {
    this.performance.speedViolations =
      (this.performance.speedViolations || 0) + 1;
  } else if (alertData.type === "route_deviation") {
    this.performance.routeDeviations =
      (this.performance.routeDeviations || 0) + 1;
  }

  return this.save();
};

// Instance method to trigger emergency
trackingSchema.methods.triggerEmergency = function (emergencyData) {
  this.emergencyData.panicButtonPressed = true;
  this.emergencyData.lastPanicAt = new Date();
  this.emergencyData.currentEmergency = {
    ...emergencyData,
    reportedAt: new Date(),
    status: "active",
  };
  this.status = "emergency";

  return this.save();
};

// Instance method to check geofences
trackingSchema.methods.checkGeofences = function () {
  const currentCoords = this.realTimeData.currentLocation.coordinates;
  const alerts = [];

  this.geofences.forEach((geofence) => {
    const distance =
      this.calculateDistance(
        currentCoords[1],
        currentCoords[0],
        geofence.coordinates[1],
        geofence.coordinates[0]
      ) * 1000; // convert to meters

    const isInside = distance <= geofence.radius;
    const wasInside = geofence.entered;

    if (isInside && !wasInside) {
      // Entered geofence
      geofence.entered = true;
      geofence.enteredAt = new Date();

      if (geofence.alerts.onEntry) {
        alerts.push({
          type: "geofence_entry",
          severity: "low",
          message: `Bus entered ${geofence.name} (${geofence.type})`,
          location: {
            coordinates: currentCoords,
            address: this.realTimeData.address,
          },
        });
      }
    } else if (!isInside && wasInside) {
      // Exited geofence
      geofence.entered = false;
      geofence.exitedAt = new Date();

      if (geofence.alerts.onExit) {
        alerts.push({
          type: "geofence_exit",
          severity: "low",
          message: `Bus exited ${geofence.name} (${geofence.type})`,
          location: {
            coordinates: currentCoords,
            address: this.realTimeData.address,
          },
        });
      }
    }
  });

  // Add alerts
  alerts.forEach((alert) => {
    this.addAlert(alert);
  });

  return this.save();
};

// Static method to find active tracking sessions
trackingSchema.statics.findActive = function () {
  return this.find({
    status: { $in: ["active", "emergency"] },
  })
    .populate("trip route bus")
    .sort({ "realTimeData.timestamp": -1 });
};

// Static method to find by location (within radius)
trackingSchema.statics.findByLocation = function (coordinates, radiusKm = 50) {
  return this.find({
    "realTimeData.currentLocation": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates, // [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000, // convert to meters
      },
    },
    status: { $in: ["active", "emergency"] },
  });
};

// Static method to find offline buses
trackingSchema.statics.findOffline = function (minutesThreshold = 10) {
  const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000);

  return this.find({
    $or: [
      { "connectivity.lastHeartbeat": { $lt: threshold } },
      { "connectivity.isOnline": false },
    ],
    status: { $ne: "completed" },
  });
};

// Static method to find emergency situations
trackingSchema.statics.findEmergencies = function () {
  return this.find({
    $or: [
      { status: "emergency" },
      { "emergencyData.panicButtonPressed": true },
      { "emergencyData.currentEmergency.status": "active" },
    ],
  }).populate("trip route bus");
};

module.exports = mongoose.model("Tracking", trackingSchema);
