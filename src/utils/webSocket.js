// src/utils/webSocket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("./logger");

class WebSocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer) {
    try {
      this.io = new Server(httpServer, {
        cors: {
          origin: process.env.CLIENT_URL || "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      // Authentication middleware
      this.io.use(async (socket, next) => {
        try {
          const token =
            socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.replace("Bearer ", "");

          if (!token) {
            return next(new Error("Authentication token required"));
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select("-password");

          if (!user || user.status !== "active") {
            return next(new Error("Invalid or inactive user"));
          }

          socket.userId = user._id.toString();
          socket.userRole = user.role;
          socket.userData = user;

          next();
        } catch (error) {
          logger.error("WebSocket authentication failed:", error.message);
          next(new Error("Authentication failed"));
        }
      });

      // Connection handling
      this.io.on("connection", (socket) => {
        this.handleConnection(socket);
      });

      this.isInitialized = true;
      logger.info("WebSocket service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize WebSocket service:", error);
      throw error;
    }
  }

  /**
   * Handle new connection
   */
  handleConnection(socket) {
    const userId = socket.userId;
    const userRole = socket.userRole;

    // Store connection
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      role: userRole,
      connectedAt: new Date(),
      lastActivity: new Date(),
    });

    logger.info(`User ${userId} (${userRole}) connected via WebSocket`);

    // Join role-based rooms
    socket.join(`role_${userRole}`);
    socket.join(`user_${userId}`);

    // Set up event handlers
    this.setupTrackingHandlers(socket);
    this.setupGeneralHandlers(socket);

    // Send welcome message
    socket.emit("connected", {
      message: "Connected to NTC Bus Tracking System",
      userId,
      role: userRole,
      timestamp: new Date(),
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      this.connectedUsers.delete(userId);
      logger.info(`User ${userId} disconnected: ${reason}`);
    });
  }

  /**
   * Set up tracking-specific event handlers
   */
  setupTrackingHandlers(socket) {
    // Subscribe to tracking updates
    socket.on("subscribe_tracking", (data) => {
      const { trackingIds, tripIds, routeIds, busIds } = data;

      if (trackingIds?.length) {
        trackingIds.forEach((id) => socket.join(`tracking_${id}`));
      }
      if (tripIds?.length) {
        tripIds.forEach((id) => socket.join(`trip_${id}`));
      }
      if (routeIds?.length) {
        routeIds.forEach((id) => socket.join(`route_${id}`));
      }
      if (busIds?.length) {
        busIds.forEach((id) => socket.join(`bus_${id}`));
      }

      socket.emit("subscription_confirmed", {
        message: "Subscribed to tracking updates",
        subscriptions: data,
      });
    });

    // Subscribe to dashboard (admin/operator only)
    socket.on("subscribe_dashboard", () => {
      if (["ntc_admin", "bus_operator"].includes(socket.userRole)) {
        socket.join("dashboard_updates");
        socket.emit("dashboard_subscription_confirmed");
      } else {
        socket.emit("error", { message: "Insufficient permissions" });
      }
    });

    // Subscribe to emergency alerts (admin only)
    socket.on("subscribe_emergencies", () => {
      if (socket.userRole === "ntc_admin") {
        socket.join("emergency_alerts");
        socket.emit("emergency_subscription_confirmed");
      } else {
        socket.emit("error", {
          message: "Only admins can subscribe to emergency alerts",
        });
      }
    });
  }

  /**
   * Set up general event handlers
   */
  setupGeneralHandlers(socket) {
    // Update activity
    socket.on("heartbeat", () => {
      const connection = this.connectedUsers.get(socket.userId);
      if (connection) {
        connection.lastActivity = new Date();
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      logger.error(`WebSocket error for user ${socket.userId}:`, error);
    });
  }

  /**
   * Broadcast location update
   */
  broadcastLocationUpdate(trackingData) {
    if (!this.isInitialized) return;

    try {
      const updateData = {
        type: "location_update",
        trackingId: trackingData.trackingId,
        tripId: trackingData.trip,
        busId: trackingData.bus,
        routeId: trackingData.route,
        location: trackingData.realTimeData.currentLocation,
        speed: trackingData.realTimeData.speed,
        heading: trackingData.realTimeData.heading,
        timestamp: trackingData.realTimeData.timestamp,
        routeProgress: trackingData.routeProgress,
      };

      // Broadcast to relevant rooms
      this.io
        .to(`tracking_${trackingData._id}`)
        .emit("location_update", updateData);
      this.io
        .to(`trip_${trackingData.trip}`)
        .emit("location_update", updateData);
      this.io.to(`bus_${trackingData.bus}`).emit("location_update", updateData);
      this.io
        .to(`route_${trackingData.route}`)
        .emit("location_update", updateData);
      this.io
        .to("dashboard_updates")
        .emit("dashboard_location_update", updateData);

      logger.debug(
        `Location update broadcasted for tracking ${trackingData.trackingId}`
      );
    } catch (error) {
      logger.error("Failed to broadcast location update:", error);
    }
  }

  /**
   * Broadcast emergency alert
   */
  broadcastEmergencyAlert(trackingData, emergencyData) {
    if (!this.isInitialized) return;

    try {
      const alertData = {
        type: "emergency_alert",
        trackingId: trackingData.trackingId,
        tripId: trackingData.trip,
        busId: trackingData.bus,
        routeId: trackingData.route,
        emergency: emergencyData,
        location: trackingData.realTimeData.currentLocation,
        timestamp: new Date(),
        severity: "critical",
      };

      this.io.to("emergency_alerts").emit("emergency_alert", alertData);
      this.io
        .to(`tracking_${trackingData._id}`)
        .emit("emergency_alert", alertData);
      this.io.to("dashboard_updates").emit("dashboard_emergency", alertData);

      logger.error(
        `Emergency alert broadcasted for tracking ${trackingData.trackingId}`
      );
    } catch (error) {
      logger.error("Failed to broadcast emergency alert:", error);
    }
  }

  /**
   * Broadcast tracking alert
   */
  broadcastTrackingAlert(trackingData, alertData) {
    if (!this.isInitialized) return;

    try {
      const broadcastData = {
        type: "tracking_alert",
        trackingId: trackingData.trackingId,
        tripId: trackingData.trip,
        busId: trackingData.bus,
        routeId: trackingData.route,
        alert: alertData,
        location: trackingData.realTimeData.currentLocation,
        timestamp: new Date(),
      };

      const rooms = [`tracking_${trackingData._id}`];

      if (["high", "critical"].includes(alertData.severity)) {
        rooms.push("dashboard_updates");
        if (alertData.severity === "critical") {
          rooms.push("emergency_alerts");
        }
      }

      rooms.forEach((room) => {
        this.io.to(room).emit("tracking_alert", broadcastData);
      });

      logger.warn(
        `Tracking alert broadcasted: ${alertData.type} (${alertData.severity})`
      );
    } catch (error) {
      logger.error("Failed to broadcast tracking alert:", error);
    }
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, event, data) {
    if (!this.isInitialized) return;

    try {
      this.io.to(`user_${userId}`).emit(event, {
        ...data,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Failed to send message to user ${userId}:`, error);
    }
  }

  /**
   * Send message to role
   */
  sendToRole(role, event, data) {
    if (!this.isInitialized) return;

    try {
      this.io.to(`role_${role}`).emit(event, {
        ...data,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Failed to send message to role ${role}:`, error);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Check if service is initialized
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      connectedUsers: this.connectedUsers.size,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
module.exports = new WebSocketManager();
