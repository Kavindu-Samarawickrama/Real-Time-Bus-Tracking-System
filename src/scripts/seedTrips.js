// src/seeders/seedTrips.js
require("dotenv").config();
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const User = require("../models/User");
const Route = require("../models/Route");
const Bus = require("../models/Bus");
const logger = require("../utils/logger");

const seedTrips = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Connected to MongoDB for trip seeding");

    // Get required data
    const [busOperators, routes, buses, ntcAdmin] = await Promise.all([
      User.find({ role: "bus_operator", status: "active" }).select("_id"),
      Route.find({ status: "active" }).select(
        "_id operatedBy routeNumber routeName"
      ),
      Bus.find({ status: "active" }).select(
        "_id registrationNumber operationalDetails capacity"
      ),
      User.findOne({ role: "ntc_admin" }),
    ]);

    if (busOperators.length === 0) {
      logger.error("No active bus operators found. Please seed users first.");
      return;
    }

    if (routes.length === 0) {
      logger.error("No active routes found. Please seed routes first.");
      return;
    }

    if (buses.length === 0) {
      logger.error("No active buses found. Please seed buses first.");
      return;
    }

    if (!ntcAdmin) {
      logger.error("NTC admin not found. Please seed users first.");
      return;
    }

    // Clear existing trips (optional - comment out if you want to keep existing data)
    await Trip.deleteMany({});
    logger.info("Cleared existing trips");

    // Get current date and time calculations
    const now = new Date();
    const hoursInMs = 60 * 60 * 1000;
    const daysInMs = 24 * hoursInMs;

    // Generate realistic trips for the next week
    const trips = [];

    // Helper function to generate unique trip number
    const generateTripNumber = (departureDate, index) => {
      const dateStr = departureDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      const tripIndex = (index + 1).toString().padStart(3, "0");
      return `TRP-${dateStr}-${tripIndex}`;
    };

    let tripIndex = 0;

    // Create trips for each active bus-route combination
    for (let i = 0; i < Math.min(routes.length, buses.length, 25); i++) {
      const route = routes[i % routes.length];
      const bus = buses[i % buses.length];
      const operator = busOperators[0]; // Using first operator for simplicity

      // Create trips for the next 7 days
      for (let day = 0; day < 7; day++) {
        // Morning trip
        const morningDeparture = new Date(
          now.getTime() + day * daysInMs + 8 * hoursInMs
        ); // 8 AM
        const morningArrival = new Date(
          morningDeparture.getTime() + 3 * hoursInMs
        ); // 3 hours journey

        const morningTripData = {
          tripNumber: generateTripNumber(morningDeparture, tripIndex++),
          route: route._id,
          bus: bus._id,
          operator: operator._id,
          schedule: {
            scheduledDeparture: morningDeparture,
            scheduledArrival: morningArrival,
          },
          crew: {
            driver: {
              name: "Kumara Wijesinghe",
              licenseNumber: "D12345678",
              contactNumber: "+94771234567",
            },
            conductor: {
              name: "Nimal Perera",
              contactNumber: "+94771234568",
            },
          },
          capacity: {
            totalSeats: bus.capacity?.totalSeats || 50,
            bookedSeats: Math.floor(Math.random() * 40) + 5, // 5-45 booked seats
            availableSeats: 0, // Will be calculated by pre-save middleware
            standingPassengers: Math.floor(Math.random() * 10),
          },
          status:
            day === 0 && morningDeparture < now
              ? "completed"
              : day === 1 && morningDeparture < now
              ? "in_transit"
              : "scheduled",
          tracking:
            day <= 1
              ? {
                  currentLocation: {
                    coordinates: {
                      latitude: 6.9271 + (Math.random() - 0.5) * 0.1,
                      longitude: 79.8612 + (Math.random() - 0.5) * 0.1,
                    },
                    address: "En route",
                    lastUpdated: new Date(
                      now.getTime() - Math.random() * 2 * hoursInMs
                    ),
                  },
                  speed: day === 1 ? Math.floor(Math.random() * 60) + 20 : 0,
                  heading: Math.floor(Math.random() * 360),
                  distanceFromOrigin: Math.floor(Math.random() * 100),
                  distanceToDestination: Math.floor(Math.random() * 50) + 10,
                }
              : {},
          fare: {
            baseFare: 250 + Math.floor(Math.random() * 200), // 250-450 LKR
            currency: "LKR",
          },
          revenue: {
            totalRevenue: 0, // Will be calculated by pre-save middleware
            ticketsSold: 0,
            averageFare: 0,
            expenses: {
              fuel: Math.floor(Math.random() * 2000) + 1000,
              toll: Math.floor(Math.random() * 500),
              maintenance: 0,
              other: Math.floor(Math.random() * 300),
            },
          },
          weather: {
            conditions: ["clear", "cloudy", "rainy"][
              Math.floor(Math.random() * 3)
            ],
            temperature: Math.floor(Math.random() * 10) + 25, // 25-35°C
            visibility: Math.floor(Math.random() * 5) + 8, // 8-12 km
          },
          metadata: {
            tripType: "regular",
            repeatPattern: "daily",
            priority: "normal",
            tags: ["morning", "weekday"],
          },
          createdBy: ntcAdmin._id,
        };

        trips.push(morningTripData);

        // Afternoon trip (if not weekend)
        if (day < 5) {
          // Weekdays only
          const afternoonDeparture = new Date(
            now.getTime() + day * daysInMs + 15 * hoursInMs
          ); // 3 PM
          const afternoonArrival = new Date(
            afternoonDeparture.getTime() + 3 * hoursInMs
          );

          const afternoonTripData = {
            tripNumber: generateTripNumber(afternoonDeparture, tripIndex++),
            route: route._id,
            bus: bus._id,
            operator: operator._id,
            schedule: {
              scheduledDeparture: afternoonDeparture,
              scheduledArrival: afternoonArrival,
            },
            crew: {
              driver: {
                name: "Sunil Rathnayake",
                licenseNumber: "D23456789",
                contactNumber: "+94772345678",
              },
              conductor: {
                name: "Priyantha Silva",
                contactNumber: "+94772345679",
              },
            },
            capacity: {
              totalSeats: bus.capacity?.totalSeats || 50,
              bookedSeats: Math.floor(Math.random() * 35) + 10,
              availableSeats: 0,
              standingPassengers: Math.floor(Math.random() * 8),
            },
            status:
              day === 0 && afternoonDeparture < now
                ? "delayed"
                : day === 1 && afternoonDeparture < now
                ? "departed"
                : "scheduled",
            tracking:
              day <= 1
                ? {
                    currentLocation: {
                      coordinates: {
                        latitude: 7.2906 + (Math.random() - 0.5) * 0.1,
                        longitude: 80.6337 + (Math.random() - 0.5) * 0.1,
                      },
                      address: "Near Kandy",
                      lastUpdated: new Date(
                        now.getTime() - Math.random() * hoursInMs
                      ),
                    },
                    speed: day === 1 ? Math.floor(Math.random() * 50) + 30 : 0,
                    heading: Math.floor(Math.random() * 360),
                    distanceFromOrigin: Math.floor(Math.random() * 80) + 20,
                    distanceToDestination: Math.floor(Math.random() * 40) + 5,
                  }
                : {},
            fare: {
              baseFare: 280 + Math.floor(Math.random() * 180),
              currency: "LKR",
            },
            revenue: {
              totalRevenue: 0,
              ticketsSold: 0,
              averageFare: 0,
              expenses: {
                fuel: Math.floor(Math.random() * 1800) + 800,
                toll: Math.floor(Math.random() * 400),
                maintenance: Math.floor(Math.random() * 500),
                other: Math.floor(Math.random() * 200),
              },
            },
            weather: {
              conditions: ["clear", "cloudy"][Math.floor(Math.random() * 2)],
              temperature: Math.floor(Math.random() * 8) + 28,
              visibility: Math.floor(Math.random() * 4) + 10,
            },
            metadata: {
              tripType: "regular",
              repeatPattern: "daily",
              priority: "normal",
              tags: ["afternoon", "weekday"],
            },
            createdBy: ntcAdmin._id,
          };

          trips.push(afternoonTripData);
        }
      }

      // Limit to avoid overwhelming the database
      if (trips.length >= 50) break;
    }

    // Add some trips with incidents for testing
    if (trips.length > 0) {
      const incidentTrip = {
        ...trips[0],
        status: "delayed",
        incidents: [
          {
            timestamp: new Date(now.getTime() - 2 * hoursInMs),
            type: "traffic_jam",
            description: "Heavy traffic due to road construction near Kegalle",
            location: {
              coordinates: {
                latitude: 7.2513,
                longitude: 80.3464,
              },
              address: "Kegalle Junction",
            },
            severity: "medium",
            resolved: true,
            resolvedAt: new Date(now.getTime() - hoursInMs),
            reportedBy: ntcAdmin._id,
          },
        ],
      };

      // Replace first trip with incident trip
      trips[0] = incidentTrip;
    }

    // Add a cancelled trip
    if (trips.length > 1) {
      trips[1] = {
        ...trips[1],
        status: "cancelled",
        incidents: [
          {
            timestamp: new Date(now.getTime() - 4 * hoursInMs),
            type: "breakdown",
            description: "Engine malfunction - trip cancelled",
            severity: "high",
            resolved: true,
            resolvedAt: new Date(now.getTime() - 3 * hoursInMs),
            reportedBy: ntcAdmin._id,
          },
        ],
      };
    }

    // Create trips with better error handling
    let createdCount = 0;
    const errors = [];

    for (let i = 0; i < trips.length; i++) {
      const tripData = trips[i];
      try {
        // Validate required fields before creating
        if (!tripData.route || !tripData.bus || !tripData.operator) {
          throw new Error(`Missing required references for trip ${i + 1}`);
        }

        if (
          !tripData.schedule?.scheduledDeparture ||
          !tripData.schedule?.scheduledArrival
        ) {
          throw new Error(`Missing schedule data for trip ${i + 1}`);
        }

        if (
          !tripData.crew?.driver?.name ||
          !tripData.crew?.driver?.licenseNumber ||
          !tripData.crew?.driver?.contactNumber
        ) {
          throw new Error(`Missing driver data for trip ${i + 1}`);
        }

        if (
          !tripData.capacity?.totalSeats ||
          tripData.capacity.totalSeats < 10
        ) {
          throw new Error(`Invalid capacity data for trip ${i + 1}`);
        }

        if (!tripData.fare?.baseFare || tripData.fare.baseFare < 0) {
          throw new Error(`Invalid fare data for trip ${i + 1}`);
        }

        const trip = new Trip(tripData);
        await trip.save();
        createdCount++;

        // Log progress every 10 trips
        if (createdCount % 10 === 0) {
          logger.info(`Created ${createdCount} trips...`);
        }
      } catch (error) {
        const errorMsg = `Failed to create trip ${i + 1}: ${error.message}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    logger.info(
      `Trip seeding completed. Created ${createdCount} out of ${trips.length} trips.`
    );

    if (errors.length > 0) {
      logger.info("Errors encountered:");
      errors.forEach((error, index) => {
        if (index < 5) {
          // Show only first 5 errors to avoid log spam
          logger.error(`  ${error}`);
        }
      });
      if (errors.length > 5) {
        logger.info(`  ... and ${errors.length - 5} more errors`);
      }
    }

    // Display summary statistics
    const [
      totalTrips,
      tripsByStatus,
      activeTrips,
      upcomingTrips,
      delayedTrips,
    ] = await Promise.all([
      Trip.countDocuments(),
      Trip.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgOccupancy: {
              $avg: {
                $multiply: [
                  {
                    $divide: ["$capacity.bookedSeats", "$capacity.totalSeats"],
                  },
                  100,
                ],
              },
            },
          },
        },
      ]),
      Trip.countDocuments({
        status: { $in: ["boarding", "departed", "in_transit"] },
      }),
      Trip.countDocuments({
        status: "scheduled",
        "schedule.scheduledDeparture": { $gte: now },
      }),
      Trip.countDocuments({ status: "delayed" }),
    ]);

    logger.info("=== TRIP SEEDING SUMMARY ===");
    logger.info(`Total trips in database: ${totalTrips}`);
    logger.info(`Currently active trips: ${activeTrips}`);
    logger.info(`Upcoming scheduled trips: ${upcomingTrips}`);
    logger.info(`Delayed trips: ${delayedTrips}`);
    logger.info("Trips by status:");
    tripsByStatus.forEach((status) => {
      logger.info(
        `  ${status._id}: ${status.count} trips (avg occupancy: ${Math.round(
          status.avgOccupancy || 0
        )}%)`
      );
    });
  } catch (error) {
    logger.error("Trip seeding failed:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedTrips().catch((error) => {
    console.error("Seeding process failed:", error);
    process.exit(1);
  });
}

module.exports = seedTrips;
