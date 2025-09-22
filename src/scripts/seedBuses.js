// src/seeders/seedBuses.js
require("dotenv").config();
const mongoose = require("mongoose");
const Bus = require("../models/Bus");
const User = require("../models/User");
const Route = require("../models/Route");
const logger = require("../utils/logger");

const seedBuses = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Connected to MongoDB for bus seeding");

    // Get bus operators for assignment
    const busOperators = await User.find({
      role: "bus_operator",
      status: "active",
    }).select("_id");

    if (busOperators.length === 0) {
      logger.error("No active bus operators found. Please seed users first.");
      return;
    }

    // Get routes for assignment
    const routes = await Route.find({ status: "active" }).select(
      "_id operatedBy"
    );

    if (routes.length === 0) {
      logger.error("No active routes found. Please seed routes first.");
      return;
    }

    const ntcAdmin = await User.findOne({ role: "ntc_admin" });
    if (!ntcAdmin) {
      logger.error("NTC admin not found. Please seed users first.");
      return;
    }

    // Clear existing buses (optional - comment out if you want to keep existing data)
    await Bus.deleteMany({});
    logger.info("Cleared existing buses");

    // Get current date for calculations
    const now = new Date();
    const daysInMs = 24 * 60 * 60 * 1000;

    // Comprehensive Sri Lankan bus data with realistic registration numbers
    const buses = [
      // Luxury AC bus
      {
        registrationNumber: "WP-1234",
        permitNumber: "LUX001",
        vehicleDetails: {
          make: "Ashok Leyland",
          model: "Viking",
          year: 2021,
          engineNumber: "AL2021001",
          chassisNumber: "ALCH2021001",
          fuelType: "diesel",
          transmissionType: "automatic",
        },
        capacity: {
          totalSeats: 45,
          standingCapacity: 0,
          wheelchairAccessible: 2,
        },
        dimensions: {
          length: 12.5,
          width: 2.5,
          height: 3.2,
        },
        amenities: {
          airConditioning: true,
          wifi: true,
          chargingPorts: true,
          entertainment: true,
          restroom: true,
          recliningSeats: true,
          luggageCompartment: true,
          firstAidKit: true,
          fireExtinguisher: true,
          gpsTracking: true,
          cctv: true,
        },
        operationalDetails: {
          operator: busOperators[0]._id,
          assignedRoute: routes.length > 0 ? routes[0]._id : null,
          currentDriver: {
            name: "Kumara Perera",
            licenseNumber: "D12345678",
            contactNumber: "+94771234567",
          },
          conductor: {
            name: "Saman Silva",
            contactNumber: "+94771234568",
          },
        },
        status: "active",
        location: {
          current: {
            coordinates: {
              latitude: 6.9271,
              longitude: 79.8612,
            },
            address: "Bastian Mawatha Terminal, Colombo",
            lastUpdated: now,
            speed: 0,
            heading: 45,
          },
          depot: {
            name: "Colombo Central Depot",
            coordinates: {
              latitude: 6.9319,
              longitude: 79.8478,
            },
            address: "Pettah, Colombo",
          },
        },
        maintenance: {
          lastService: new Date(now.getTime() - 60 * daysInMs),
          currentMileage: 125000,
          fitnessExpiry: new Date(now.getTime() + 300 * daysInMs),
          insuranceExpiry: new Date(now.getTime() + 200 * daysInMs),
          emissionTestExpiry: new Date(now.getTime() + 150 * daysInMs),
          maintenanceRecords: [
            {
              date: new Date(now.getTime() - 60 * daysInMs),
              type: "routine",
              description: "Regular service and oil change",
              cost: 15000,
              performedBy: "ABC Motors",
              mileageAtService: 120000,
            },
          ],
        },
        compliance: {
          routePermitExpiry: new Date(now.getTime() + 180 * daysInMs),
          revenuePermitExpiry: new Date(now.getTime() + 240 * daysInMs),
          ntcRegistrationExpiry: new Date(now.getTime() + 365 * daysInMs),
          lastInspection: new Date(now.getTime() - 90 * daysInMs),
        },
        statistics: {
          totalTrips: 450,
          totalKilometers: 52000,
          averageSpeed: 45,
          fuelEfficiency: 3.2,
          lastTripDate: now,
          monthlyRevenue: 180000,
          passengerCount: 12500,
          rating: {
            average: 4.2,
            totalReviews: 89,
          },
        },
        createdBy: ntcAdmin._id,
        approvedBy: ntcAdmin._id,
        approvedAt: now,
      },
      // Express bus
      {
        registrationNumber: "CP-5678",
        permitNumber: "EXP002",
        vehicleDetails: {
          make: "Tata",
          model: "Starbus",
          year: 2020,
          engineNumber: "TT2020002",
          chassisNumber: "TTCH2020002",
          fuelType: "diesel",
          transmissionType: "manual",
        },
        capacity: {
          totalSeats: 52,
          standingCapacity: 15,
          wheelchairAccessible: 0,
        },
        dimensions: {
          length: 11.0,
          width: 2.4,
          height: 3.0,
        },
        amenities: {
          airConditioning: true,
          wifi: false,
          chargingPorts: true,
          entertainment: false,
          restroom: false,
          recliningSeats: false,
          luggageCompartment: true,
          firstAidKit: true,
          fireExtinguisher: true,
          gpsTracking: true,
          cctv: false,
        },
        operationalDetails: {
          operator: busOperators[0]._id,
          assignedRoute: routes.length > 1 ? routes[1]._id : null,
          currentDriver: {
            name: "Nimal Fernando",
            licenseNumber: "D23456789",
            contactNumber: "+94772345678",
          },
          conductor: {
            name: "Ajith Mendis",
            contactNumber: "+94772345679",
          },
        },
        status: "active",
        location: {
          current: {
            coordinates: {
              latitude: 6.0329,
              longitude: 80.217,
            },
            address: "Galle Bus Terminal",
            lastUpdated: now,
            speed: 0,
            heading: 180,
          },
          depot: {
            name: "Galle Depot",
            coordinates: {
              latitude: 6.0281,
              longitude: 80.217,
            },
            address: "Galle",
          },
        },
        maintenance: {
          lastService: new Date(now.getTime() - 45 * daysInMs),
          currentMileage: 98000,
          fitnessExpiry: new Date(now.getTime() + 280 * daysInMs),
          insuranceExpiry: new Date(now.getTime() + 220 * daysInMs),
          emissionTestExpiry: new Date(now.getTime() + 160 * daysInMs),
        },
        compliance: {
          routePermitExpiry: new Date(now.getTime() + 190 * daysInMs),
          revenuePermitExpiry: new Date(now.getTime() + 250 * daysInMs),
          ntcRegistrationExpiry: new Date(now.getTime() + 350 * daysInMs),
          lastInspection: new Date(now.getTime() - 120 * daysInMs),
        },
        statistics: {
          totalTrips: 380,
          totalKilometers: 45000,
          averageSpeed: 50,
          fuelEfficiency: 3.5,
          lastTripDate: now,
          monthlyRevenue: 160000,
          passengerCount: 11200,
          rating: {
            average: 4.0,
            totalReviews: 67,
          },
        },
        createdBy: ntcAdmin._id,
        approvedBy: ntcAdmin._id,
        approvedAt: now,
      },
      // Normal bus
      {
        registrationNumber: "NC-9012",
        permitNumber: "NOR003",
        vehicleDetails: {
          make: "Eicher",
          model: "Starline",
          year: 2019,
          engineNumber: "EC2019003",
          chassisNumber: "ECCH2019003",
          fuelType: "diesel",
          transmissionType: "manual",
        },
        capacity: {
          totalSeats: 58,
          standingCapacity: 20,
          wheelchairAccessible: 0,
        },
        dimensions: {
          length: 10.5,
          width: 2.3,
          height: 2.9,
        },
        amenities: {
          airConditioning: false,
          wifi: false,
          chargingPorts: false,
          entertainment: false,
          restroom: false,
          recliningSeats: false,
          luggageCompartment: true,
          firstAidKit: true,
          fireExtinguisher: true,
          gpsTracking: true,
          cctv: false,
        },
        operationalDetails: {
          operator: busOperators[0]._id,
          assignedRoute: routes.length > 2 ? routes[2]._id : null,
          currentDriver: {
            name: "Ranjith Bandara",
            licenseNumber: "D34567890",
            contactNumber: "+94773456789",
          },
          conductor: {
            name: "Priyanka Jayaweera",
            contactNumber: "+94773456790",
          },
        },
        status: "active",
        location: {
          current: {
            coordinates: {
              latitude: 8.3114,
              longitude: 80.4037,
            },
            address: "Anuradhapura New Terminal",
            lastUpdated: now,
            speed: 0,
            heading: 270,
          },
          depot: {
            name: "Anuradhapura Depot",
            coordinates: {
              latitude: 8.315,
              longitude: 80.41,
            },
            address: "Anuradhapura",
          },
        },
        maintenance: {
          lastService: new Date(now.getTime() - 30 * daysInMs),
          currentMileage: 156000,
          fitnessExpiry: new Date(now.getTime() + 320 * daysInMs),
          insuranceExpiry: new Date(now.getTime() + 180 * daysInMs),
          emissionTestExpiry: new Date(now.getTime() + 140 * daysInMs),
        },
        compliance: {
          routePermitExpiry: new Date(now.getTime() + 170 * daysInMs),
          revenuePermitExpiry: new Date(now.getTime() + 230 * daysInMs),
          ntcRegistrationExpiry: new Date(now.getTime() + 340 * daysInMs),
          lastInspection: new Date(now.getTime() - 100 * daysInMs),
        },
        statistics: {
          totalTrips: 520,
          totalKilometers: 65000,
          averageSpeed: 42,
          fuelEfficiency: 4.1,
          lastTripDate: now,
          monthlyRevenue: 195000,
          passengerCount: 15600,
          rating: {
            average: 3.8,
            totalReviews: 124,
          },
        },
        createdBy: ntcAdmin._id,
        approvedBy: ntcAdmin._id,
        approvedAt: now,
      },
      // Bus in maintenance
      {
        registrationNumber: "EP-3456",
        permitNumber: "EAS004",
        vehicleDetails: {
          make: "Mahindra",
          model: "Tourister",
          year: 2022,
          engineNumber: "MH2022004",
          chassisNumber: "MHCH2022004",
          fuelType: "diesel",
          transmissionType: "manual",
        },
        capacity: {
          totalSeats: 49,
          standingCapacity: 10,
          wheelchairAccessible: 1,
        },
        dimensions: {
          length: 11.5,
          width: 2.4,
          height: 3.1,
        },
        amenities: {
          airConditioning: true,
          wifi: false,
          chargingPorts: true,
          entertainment: false,
          restroom: false,
          recliningSeats: false,
          luggageCompartment: true,
          firstAidKit: true,
          fireExtinguisher: true,
          gpsTracking: true,
          cctv: true,
        },
        operationalDetails: {
          operator: busOperators[0]._id,
          // No assigned route during maintenance
        },
        status: "maintenance",
        location: {
          depot: {
            name: "Batticaloa Depot",
            coordinates: {
              latitude: 7.7102,
              longitude: 81.6924,
            },
            address: "Batticaloa",
          },
        },
        maintenance: {
          lastService: new Date(now.getTime() - 15 * daysInMs),
          currentMileage: 45000,
          fitnessExpiry: new Date(now.getTime() + 400 * daysInMs),
          insuranceExpiry: new Date(now.getTime() + 300 * daysInMs),
          emissionTestExpiry: new Date(now.getTime() + 200 * daysInMs),
          maintenanceRecords: [
            {
              date: new Date(now.getTime() - 5 * daysInMs),
              type: "repair",
              description: "Engine overhaul and transmission repair",
              cost: 85000,
              performedBy: "Eastern Auto Works",
              mileageAtService: 44800,
            },
          ],
        },
        compliance: {
          routePermitExpiry: new Date(now.getTime() + 200 * daysInMs),
          revenuePermitExpiry: new Date(now.getTime() + 280 * daysInMs),
          ntcRegistrationExpiry: new Date(now.getTime() + 380 * daysInMs),
          lastInspection: new Date(now.getTime() - 80 * daysInMs),
        },
        statistics: {
          totalTrips: 220,
          totalKilometers: 28000,
          averageSpeed: 38,
          fuelEfficiency: 3.8,
          lastTripDate: new Date(now.getTime() - 10 * daysInMs),
          monthlyRevenue: 145000,
          passengerCount: 8900,
          rating: {
            average: 4.1,
            totalReviews: 45,
          },
        },
        createdBy: ntcAdmin._id,
        approvedBy: ntcAdmin._id,
        approvedAt: now,
      },
      // Pending approval bus
      {
        registrationNumber: "NW-2468",
        permitNumber: "NW006",
        vehicleDetails: {
          make: "Tata",
          model: "LP 1618",
          year: 2023,
          engineNumber: "TT2023006",
          chassisNumber: "TTCH2023006",
          fuelType: "diesel",
          transmissionType: "manual",
        },
        capacity: {
          totalSeats: 56,
          standingCapacity: 20,
          wheelchairAccessible: 2,
        },
        dimensions: {
          length: 11.2,
          width: 2.4,
          height: 3.0,
        },
        amenities: {
          airConditioning: false,
          wifi: false,
          chargingPorts: true,
          entertainment: false,
          restroom: false,
          recliningSeats: false,
          luggageCompartment: true,
          firstAidKit: true,
          fireExtinguisher: true,
          gpsTracking: true,
          cctv: false,
        },
        operationalDetails: {
          operator: busOperators[0]._id,
          // No assigned route - pending approval
        },
        status: "pending_approval",
        location: {
          depot: {
            name: "Chilaw Depot",
            coordinates: {
              latitude: 7.5756,
              longitude: 79.7951,
            },
            address: "Chilaw",
          },
        },
        maintenance: {
          currentMileage: 0, // New bus
          fitnessExpiry: new Date(now.getTime() + 365 * daysInMs),
          insuranceExpiry: new Date(now.getTime() + 365 * daysInMs),
          emissionTestExpiry: new Date(now.getTime() + 365 * daysInMs),
        },
        compliance: {
          routePermitExpiry: new Date(now.getTime() + 365 * daysInMs),
          revenuePermitExpiry: new Date(now.getTime() + 365 * daysInMs),
          ntcRegistrationExpiry: new Date(now.getTime() + 365 * daysInMs),
        },
        statistics: {
          totalTrips: 0,
          totalKilometers: 0,
          averageSpeed: 0,
          fuelEfficiency: 0,
          monthlyRevenue: 0,
          passengerCount: 0,
          rating: {
            average: 0,
            totalReviews: 0,
          },
        },
        createdBy: ntcAdmin._id,
      },
    ];

    // Create buses
    let createdCount = 0;
    for (const busData of buses) {
      try {
        const existingBus = await Bus.findOne({
          $or: [
            { registrationNumber: busData.registrationNumber },
            { permitNumber: busData.permitNumber },
          ],
        });

        if (!existingBus) {
          const bus = new Bus(busData);
          await bus.save();

          logger.info(
            `Created bus: ${busData.registrationNumber} - ${busData.vehicleDetails.make} ${busData.vehicleDetails.model} (${busData.status})`
          );
          createdCount++;
        } else {
          logger.info(`Bus already exists: ${busData.registrationNumber}`);
        }
      } catch (error) {
        logger.error(
          `Failed to create bus ${busData.registrationNumber}:`,
          error.message
        );
      }
    }

    logger.info(
      `Bus seeding completed successfully. Created ${createdCount} new buses.`
    );

    // Display summary statistics
    const totalBuses = await Bus.countDocuments();
    const busesByStatus = await Bus.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const busesByMake = await Bus.aggregate([
      {
        $group: {
          _id: "$vehicleDetails.make",
          count: { $sum: 1 },
          avgYear: { $avg: "$vehicleDetails.year" },
          totalSeats: { $sum: "$capacity.totalSeats" },
        },
      },
    ]);

    const assignedBuses = await Bus.countDocuments({
      "operationalDetails.assignedRoute": { $exists: true, $ne: null },
    });

    const needingService = await Bus.countDocuments({
      $or: [
        {
          "maintenance.nextServiceDue": {
            $lte: new Date(now.getTime() + 7 * daysInMs),
          },
        },
        { "maintenance.nextServiceDue": { $exists: false } },
        { "maintenance.nextServiceDue": null },
      ],
    });

    logger.info("=== BUS SEEDING SUMMARY ===");
    logger.info(`Total buses in database: ${totalBuses}`);
    logger.info(`Buses assigned to routes: ${assignedBuses}`);
    logger.info(`Buses needing service: ${needingService}`);
    logger.info("Buses by status:");
    busesByStatus.forEach((status) => {
      logger.info(`  ${status._id}: ${status.count}`);
    });
    logger.info("Buses by manufacturer:");
    busesByMake.forEach((make) => {
      logger.info(
        `  ${make._id}: ${make.count} buses (avg year: ${Math.round(
          make.avgYear
        )}, total seats: ${make.totalSeats})`
      );
    });
  } catch (error) {
    logger.error("Bus seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedBuses();
}

module.exports = seedBuses;
