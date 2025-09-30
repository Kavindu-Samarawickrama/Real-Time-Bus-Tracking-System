// src/scripts/seedAll.js
require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("../utils/logger");

// Import all seeders
const seedUsers = require("./seedUsers");
const seedRoutes = require("./seedRoutes");
const seedBuses = require("./seedBuses");
const seedTrips = require("./seedTrips");

const seedAll = async () => {
  try {
    logger.info("=== STARTING COMPLETE DATABASE SEEDING ===");
    logger.info(`Timestamp: ${new Date().toISOString()}`);

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("✓ Connected to MongoDB");

    // Seed in correct order (respecting dependencies)
    logger.info("\n--- Step 1: Seeding Users ---");
    await seedUsers();

    logger.info("\n--- Step 2: Seeding Routes ---");
    await seedRoutes();

    logger.info("\n--- Step 3: Seeding Buses ---");
    await seedBuses();

    logger.info("\n--- Step 4: Seeding Trips ---");
    await seedTrips();

    logger.info("\n=== DATABASE SEEDING COMPLETED SUCCESSFULLY ===");
    logger.info("All collections have been populated with seed data.");

    // Display final statistics
    const User = require("../models/User");
    const Route = require("../models/Route");
    const Bus = require("../models/Bus");
    const Trip = require("../models/Trip");

    const stats = {
      users: await User.countDocuments(),
      routes: await Route.countDocuments(),
      buses: await Bus.countDocuments(),
      trips: await Trip.countDocuments(),
    };

    logger.info("\n=== FINAL DATABASE STATISTICS ===");
    logger.info(`Total Users: ${stats.users}`);
    logger.info(`Total Routes: ${stats.routes}`);
    logger.info(`Total Buses: ${stats.buses}`);
    logger.info(`Total Trips: ${stats.trips}`);
  } catch (error) {
    logger.error("\n❌ SEEDING FAILED:", error);
    logger.error("Error details:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info("\n✓ Database connection closed");
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  seedAll();
}

module.exports = seedAll;
