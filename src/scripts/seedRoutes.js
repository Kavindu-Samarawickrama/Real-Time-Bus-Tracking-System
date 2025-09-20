// src/seeders/seedRoutes.js
require("dotenv").config();
const mongoose = require("mongoose");
const Route = require("../models/Route");
const User = require("../models/User");
const logger = require("../utils/logger");

const seedRoutes = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Connected to MongoDB for route seeding");

    // Get bus operators for route assignment
    const busOperators = await User.find({
      role: "bus_operator",
      status: "active",
    }).select("_id");

    if (busOperators.length === 0) {
      logger.error("No active bus operators found. Please seed users first.");
      return;
    }

    const ntcAdmin = await User.findOne({ role: "ntc_admin" });
    if (!ntcAdmin) {
      logger.error("NTC admin not found. Please seed users first.");
      return;
    }

    // Clear existing routes (optional - comment out if you want to keep existing data)
    await Route.deleteMany({});
    logger.info("Cleared existing routes");

    // Comprehensive Sri Lankan inter-provincial bus routes based on NTC data
    const routes = [
      {
        routeNumber: "001",
        routeName: "Colombo - Kandy Express",
        origin: {
          city: "Colombo",
          province: "Western",
          coordinates: { latitude: 6.9271, longitude: 79.8612 },
          terminalName: "Bastian Mawatha Bus Terminal",
        },
        destination: {
          city: "Kandy",
          province: "Central",
          coordinates: { latitude: 7.2906, longitude: 80.6337 },
          terminalName: "Kandy Bus Terminal",
        },
        waypoints: [
          {
            name: "Kadawatha",
            city: "Gampaha",
            coordinates: { latitude: 7.0107, longitude: 79.95 },
            estimatedTravelTime: 25,
            stopOrder: 1,
            stopDuration: 3,
          },
          {
            name: "Nittambuwa",
            city: "Gampaha",
            coordinates: { latitude: 7.1423, longitude: 80.0872 },
            estimatedTravelTime: 45,
            stopOrder: 2,
            stopDuration: 5,
          },
          {
            name: "Kegalle",
            city: "Kegalle",
            coordinates: { latitude: 7.2513, longitude: 80.3464 },
            estimatedTravelTime: 90,
            stopOrder: 3,
            stopDuration: 10,
          },
        ],
        distance: 115,
        estimatedDuration: 180,
        operatingHours: {
          firstDeparture: "05:00",
          lastDeparture: "22:00",
          frequency: 30,
        },
        routeType: "express",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 410,
          currency: "LKR",
        },
        amenities: {
          airConditioned: true,
          wifi: false,
          chargingPorts: true,
          restroom: false,
          entertainment: false,
        },
      },
      {
        routeNumber: "002",
        routeName: "Colombo - Galle Highway",
        origin: {
          city: "Colombo",
          province: "Western",
          coordinates: { latitude: 6.9271, longitude: 79.8612 },
          terminalName: "Pettah Bus Terminal",
        },
        destination: {
          city: "Galle",
          province: "Southern",
          coordinates: { latitude: 6.0329, longitude: 80.217 },
          terminalName: "Galle Bus Terminal",
        },
        waypoints: [
          {
            name: "Moratuwa",
            city: "Colombo",
            coordinates: { latitude: 6.7728, longitude: 79.8819 },
            estimatedTravelTime: 30,
            stopOrder: 1,
            stopDuration: 5,
          },
          {
            name: "Kalutara",
            city: "Kalutara",
            coordinates: { latitude: 6.5854, longitude: 79.9607 },
            estimatedTravelTime: 60,
            stopOrder: 2,
            stopDuration: 8,
          },
          {
            name: "Hikkaduwa",
            city: "Galle",
            coordinates: { latitude: 6.1414, longitude: 80.1014 },
            estimatedTravelTime: 120,
            stopOrder: 3,
            stopDuration: 5,
          },
        ],
        distance: 119,
        estimatedDuration: 150,
        operatingHours: {
          firstDeparture: "05:30",
          lastDeparture: "21:30",
          frequency: 20,
        },
        routeType: "semi_express",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 280,
          currency: "LKR",
        },
        amenities: {
          airConditioned: true,
          wifi: true,
          chargingPorts: true,
          restroom: false,
          entertainment: true,
        },
      },
      {
        routeNumber: "003",
        routeName: "Colombo - Anuradhapura Express",
        origin: {
          city: "Colombo",
          province: "Western",
          coordinates: { latitude: 6.9271, longitude: 79.8612 },
          terminalName: "Bastian Mawatha Bus Terminal",
        },
        destination: {
          city: "Anuradhapura",
          province: "North Central",
          coordinates: { latitude: 8.3114, longitude: 80.4037 },
          terminalName: "New Bus Terminal",
        },
        waypoints: [
          {
            name: "Kurunegala",
            city: "Kurunegala",
            coordinates: { latitude: 7.4863, longitude: 80.3647 },
            estimatedTravelTime: 120,
            stopOrder: 1,
            stopDuration: 15,
          },
          {
            name: "Dambulla",
            city: "Matale",
            coordinates: { latitude: 7.9403, longitude: 80.6516 },
            estimatedTravelTime: 180,
            stopOrder: 2,
            stopDuration: 10,
          },
        ],
        distance: 206,
        estimatedDuration: 240,
        operatingHours: {
          firstDeparture: "05:00",
          lastDeparture: "20:00",
          frequency: 45,
        },
        routeType: "express",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 520,
          currency: "LKR",
        },
        amenities: {
          airConditioned: false,
          wifi: false,
          chargingPorts: false,
          restroom: true,
          entertainment: false,
        },
      },
      {
        routeNumber: "004",
        routeName: "Kandy - Jaffna Direct",
        origin: {
          city: "Kandy",
          province: "Central",
          coordinates: { latitude: 7.2906, longitude: 80.6337 },
          terminalName: "Kandy Bus Terminal",
        },
        destination: {
          city: "Jaffna",
          province: "Northern",
          coordinates: { latitude: 9.6615, longitude: 80.0255 },
          terminalName: "Jaffna Bus Terminal",
        },
        waypoints: [
          {
            name: "Dambulla",
            city: "Matale",
            coordinates: { latitude: 7.9403, longitude: 80.6516 },
            estimatedTravelTime: 60,
            stopOrder: 1,
            stopDuration: 10,
          },
          {
            name: "Anuradhapura",
            city: "Anuradhapura",
            coordinates: { latitude: 8.3114, longitude: 80.4037 },
            estimatedTravelTime: 150,
            stopOrder: 2,
            stopDuration: 15,
          },
          {
            name: "Vavuniya",
            city: "Vavuniya",
            coordinates: { latitude: 8.7514, longitude: 80.4971 },
            estimatedTravelTime: 210,
            stopOrder: 3,
            stopDuration: 20,
          },
        ],
        distance: 285,
        estimatedDuration: 360,
        operatingHours: {
          firstDeparture: "06:00",
          lastDeparture: "18:00",
          frequency: 120,
        },
        routeType: "luxury",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 850,
          currency: "LKR",
        },
        amenities: {
          airConditioned: true,
          wifi: true,
          chargingPorts: true,
          restroom: true,
          entertainment: true,
        },
      },
      {
        routeNumber: "005",
        routeName: "Colombo - Batticaloa Express",
        origin: {
          city: "Colombo",
          province: "Western",
          coordinates: { latitude: 6.9271, longitude: 79.8612 },
          terminalName: "Bastian Mawatha Bus Terminal",
        },
        destination: {
          city: "Batticaloa",
          province: "Eastern",
          coordinates: { latitude: 7.7102, longitude: 81.6924 },
          terminalName: "Batticaloa Bus Terminal",
        },
        waypoints: [
          {
            name: "Kandy",
            city: "Kandy",
            coordinates: { latitude: 7.2906, longitude: 80.6337 },
            estimatedTravelTime: 180,
            stopOrder: 1,
            stopDuration: 20,
          },
          {
            name: "Mahiyanganaya",
            city: "Badulla",
            coordinates: { latitude: 7.3311, longitude: 81.0011 },
            estimatedTravelTime: 300,
            stopOrder: 2,
            stopDuration: 15,
          },
        ],
        distance: 314,
        estimatedDuration: 420,
        operatingHours: {
          firstDeparture: "06:00",
          lastDeparture: "16:00",
          frequency: 180,
        },
        routeType: "normal",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 780,
          currency: "LKR",
        },
        amenities: {
          airConditioned: false,
          wifi: false,
          chargingPorts: false,
          restroom: true,
          entertainment: false,
        },
      },
      {
        routeNumber: "006",
        routeName: "Colombo - Ratnapura Express",
        origin: {
          city: "Colombo",
          province: "Western",
          coordinates: { latitude: 6.9271, longitude: 79.8612 },
          terminalName: "Bastian Mawatha Bus Terminal",
        },
        destination: {
          city: "Ratnapura",
          province: "Sabaragamuwa",
          coordinates: { latitude: 6.6828, longitude: 80.4126 },
          terminalName: "Ratnapura Bus Terminal",
        },
        waypoints: [
          {
            name: "Homagama",
            city: "Colombo",
            coordinates: { latitude: 6.8441, longitude: 80.0024 },
            estimatedTravelTime: 45,
            stopOrder: 1,
            stopDuration: 5,
          },
          {
            name: "Avissawella",
            city: "Colombo",
            coordinates: { latitude: 6.9515, longitude: 80.2091 },
            estimatedTravelTime: 75,
            stopOrder: 2,
            stopDuration: 10,
          },
        ],
        distance: 101,
        estimatedDuration: 150,
        operatingHours: {
          firstDeparture: "05:30",
          lastDeparture: "21:00",
          frequency: 30,
        },
        routeType: "semi_express",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 320,
          currency: "LKR",
        },
        amenities: {
          airConditioned: true,
          wifi: false,
          chargingPorts: true,
          restroom: false,
          entertainment: false,
        },
      },
      {
        routeNumber: "007",
        routeName: "Kandy - Badulla Hill Country",
        origin: {
          city: "Kandy",
          province: "Central",
          coordinates: { latitude: 7.2906, longitude: 80.6337 },
          terminalName: "Kandy Bus Terminal",
        },
        destination: {
          city: "Badulla",
          province: "Uva",
          coordinates: { latitude: 6.9895, longitude: 81.055 },
          terminalName: "Badulla Bus Terminal",
        },
        waypoints: [
          {
            name: "Nuwara Eliya",
            city: "Nuwara Eliya",
            coordinates: { latitude: 6.9497, longitude: 80.7891 },
            estimatedTravelTime: 120,
            stopOrder: 1,
            stopDuration: 15,
          },
          {
            name: "Welimada",
            city: "Badulla",
            coordinates: { latitude: 6.9037, longitude: 80.9296 },
            estimatedTravelTime: 180,
            stopOrder: 2,
            stopDuration: 10,
          },
        ],
        distance: 97,
        estimatedDuration: 210,
        operatingHours: {
          firstDeparture: "06:00",
          lastDeparture: "19:00",
          frequency: 60,
        },
        routeType: "normal",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 290,
          currency: "LKR",
        },
        amenities: {
          airConditioned: false,
          wifi: false,
          chargingPorts: false,
          restroom: false,
          entertainment: false,
        },
      },
      {
        routeNumber: "008",
        routeName: "Colombo - Trincomalee Coastal",
        origin: {
          city: "Colombo",
          province: "Western",
          coordinates: { latitude: 6.9271, longitude: 79.8612 },
          terminalName: "Bastian Mawatha Bus Terminal",
        },
        destination: {
          city: "Trincomalee",
          province: "Eastern",
          coordinates: { latitude: 8.5874, longitude: 81.2152 },
          terminalName: "Trincomalee Bus Terminal",
        },
        waypoints: [
          {
            name: "Kurunegala",
            city: "Kurunegala",
            coordinates: { latitude: 7.4863, longitude: 80.3647 },
            estimatedTravelTime: 120,
            stopOrder: 1,
            stopDuration: 15,
          },
          {
            name: "Anuradhapura",
            city: "Anuradhapura",
            coordinates: { latitude: 8.3114, longitude: 80.4037 },
            estimatedTravelTime: 240,
            stopOrder: 2,
            stopDuration: 20,
          },
        ],
        distance: 268,
        estimatedDuration: 360,
        operatingHours: {
          firstDeparture: "05:00",
          lastDeparture: "17:00",
          frequency: 120,
        },
        routeType: "express",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 720,
          currency: "LKR",
        },
        amenities: {
          airConditioned: true,
          wifi: false,
          chargingPorts: true,
          restroom: true,
          entertainment: false,
        },
      },
      {
        routeNumber: "009",
        routeName: "Galle - Matara Southern Express",
        origin: {
          city: "Galle",
          province: "Southern",
          coordinates: { latitude: 6.0329, longitude: 80.217 },
          terminalName: "Galle Bus Terminal",
        },
        destination: {
          city: "Matara",
          province: "Southern",
          coordinates: { latitude: 5.9549, longitude: 80.555 },
          terminalName: "Matara Bus Terminal",
        },
        waypoints: [
          {
            name: "Unawatuna",
            city: "Galle",
            coordinates: { latitude: 6.0108, longitude: 80.2489 },
            estimatedTravelTime: 15,
            stopOrder: 1,
            stopDuration: 3,
          },
          {
            name: "Weligama",
            city: "Matara",
            coordinates: { latitude: 5.975, longitude: 80.4297 },
            estimatedTravelTime: 30,
            stopOrder: 2,
            stopDuration: 5,
          },
        ],
        distance: 45,
        estimatedDuration: 60,
        operatingHours: {
          firstDeparture: "05:00",
          lastDeparture: "22:00",
          frequency: 15,
        },
        routeType: "normal",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 120,
          currency: "LKR",
        },
        amenities: {
          airConditioned: false,
          wifi: false,
          chargingPorts: false,
          restroom: false,
          entertainment: false,
        },
      },
      {
        routeNumber: "010",
        routeName: "Colombo - Chilaw Coastal",
        origin: {
          city: "Colombo",
          province: "Western",
          coordinates: { latitude: 6.9271, longitude: 79.8612 },
          terminalName: "Pettah Bus Terminal",
        },
        destination: {
          city: "Chilaw",
          province: "North Western",
          coordinates: { latitude: 7.5756, longitude: 79.7951 },
          terminalName: "Chilaw Bus Terminal",
        },
        waypoints: [
          {
            name: "Negombo",
            city: "Gampaha",
            coordinates: { latitude: 7.2083, longitude: 79.8358 },
            estimatedTravelTime: 45,
            stopOrder: 1,
            stopDuration: 8,
          },
          {
            name: "Marawila",
            city: "Puttalam",
            coordinates: { latitude: 7.4502, longitude: 79.8141 },
            estimatedTravelTime: 75,
            stopOrder: 2,
            stopDuration: 5,
          },
        ],
        distance: 76,
        estimatedDuration: 105,
        operatingHours: {
          firstDeparture: "05:30",
          lastDeparture: "21:30",
          frequency: 30,
        },
        routeType: "normal",
        operatedBy: [busOperators[0]._id],
        createdBy: ntcAdmin._id,
        fare: {
          baseFare: 180,
          currency: "LKR",
        },
        amenities: {
          airConditioned: false,
          wifi: false,
          chargingPorts: false,
          restroom: false,
          entertainment: false,
        },
      },
    ];

    // Create routes
    let createdCount = 0;
    for (const routeData of routes) {
      const existingRoute = await Route.findOne({
        routeNumber: routeData.routeNumber,
      });

      if (!existingRoute) {
        const route = new Route(routeData);
        await route.save();

        logger.info(
          `Created route: ${routeData.routeNumber} - ${routeData.routeName}`
        );
        createdCount++;
      } else {
        logger.info(`Route already exists: ${routeData.routeNumber}`);
      }
    }

    logger.info(
      `Route seeding completed successfully. Created ${createdCount} new routes.`
    );

    // Display summary statistics
    const totalRoutes = await Route.countDocuments();
    const routesByType = await Route.aggregate([
      {
        $group: {
          _id: "$routeType",
          count: { $sum: 1 },
        },
      },
    ]);

    const interProvincialCount = await Route.countDocuments({
      $expr: { $ne: ["$origin.province", "$destination.province"] },
    });

    logger.info("=== ROUTE SEEDING SUMMARY ===");
    logger.info(`Total routes in database: ${totalRoutes}`);
    logger.info(`Inter-provincial routes: ${interProvincialCount}`);
    logger.info("Routes by type:");
    routesByType.forEach((type) => {
      logger.info(`  ${type._id}: ${type.count}`);
    });
  } catch (error) {
    logger.error("Route seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedRoutes();
}

module.exports = seedRoutes;
