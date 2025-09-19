const mongoose = require("mongoose");
const logger = require("./logger");

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI;

      if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
      }

      // Connection options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 5, // Maintain minimum 5 socket connections
        bufferMaxEntries: 0,
        bufferCommands: false,
      };

      this.connection = await mongoose.connect(mongoUri, options);

      logger.info("MongoDB connected successfully");

      // Handle connection events
      mongoose.connection.on("connected", () => {
        logger.info("Mongoose connected to MongoDB");
      });

      mongoose.connection.on("error", (err) => {
        logger.error("Mongoose connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("Mongoose disconnected from MongoDB");
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await this.disconnect();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      logger.error("MongoDB connection failed:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
      }
    } catch (error) {
      logger.error("Error closing MongoDB connection:", error);
      throw error;
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  getConnectionState() {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[mongoose.connection.readyState];
  }
}

module.exports = new Database();
