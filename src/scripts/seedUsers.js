require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const logger = require("../utils/logger");

const seedUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Connected to MongoDB for seeding");

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // logger.info('Cleared existing users');

    // Seed users data
    const users = [
      {
        username: "ntc_admin_001",
        email: "admin@ntc.gov.lk",
        password: "NTC@Admin123!",
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
        username: "operator_001",
        email: "operator1@buscompany.lk",
        password: "Operator123!",
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
        username: "commuter_001",
        email: "user1@example.com",
        password: "User123!",
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

    // Hash passwords and create users
    for (const userData of users) {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        userData.password = hashedPassword;

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
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
