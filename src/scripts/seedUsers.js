// src/seeders/seedUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const logger = require("../utils/logger");

const seedUsers = async () => {
  try {
    logger.info("Connected to MongoDB for user seeding");

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    logger.info("Cleared existing users");

    // Seed users data - DO NOT hash passwords here, let the model do it
    const users = [
      {
        username: "ntcadmin001",
        email: "admin@ntc.gov.lk",
        password: "NTC@Admin123!", // Plain text - model will hash it
        role: "ntc_admin",
        status: "active",
        profile: {
          firstName: "System",
          lastName: "Administrator",
          phone: "+94112345678",
          address: {
            street: "Transport Secretariat",
            city: "Colombo",
            province: "Western",
            postalCode: "00100",
          },
        },
        organizationDetails: {
          employeeId: "NTC001",
          department: "IT Department",
          designation: "System Administrator",
        },
        emailVerified: true,
      },
      {
        username: "operator001",
        email: "operator1@buscompany.lk",
        password: "Operator123!", // Plain text - model will hash it
        role: "bus_operator",
        status: "active",
        profile: {
          firstName: "Saman",
          lastName: "Perera",
          phone: "+94771234567",
          address: {
            street: "Main Street",
            city: "Kandy",
            province: "Central",
            postalCode: "20000",
          },
        },
        organizationDetails: {
          operatorLicense: "OP001",
          companyName: "Kandy Express Bus Service",
          businessRegNumber: "BRN12345",
        },
        emailVerified: true,
      },
      {
        username: "commuter001",
        email: "user1@example.com",
        password: "User123!", // Plain text - model will hash it
        role: "commuter",
        status: "active",
        profile: {
          firstName: "Nimal",
          lastName: "Silva",
          phone: "+94711234567",
          address: {
            street: "Galle Road",
            city: "Negombo",
            province: "Western",
            postalCode: "11500",
          },
        },
        emailVerified: true,
      },
    ];

    // Create users WITHOUT manually hashing passwords
    for (const userData of users) {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (!existingUser) {
        // Don't hash password here - let the model's pre-save middleware do it
        const user = new User(userData);
        await user.save();

        logger.info(`Created user: ${userData.email} (${userData.role})`);
      } else {
        logger.info(`User already exists: ${userData.email}`);
      }
    }

    logger.info("User seeding completed successfully");
  } catch (error) {
    logger.error("User seeding failed:", error);
    throw error; // Re-throw to let seedAll handle it
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      await seedUsers();
    } catch (error) {
      logger.error("Failed:", error);
    } finally {
      await mongoose.connection.close();
      process.exit(0);
    }
  })();
}

module.exports = seedUsers;
