// src/services/userService.js
const userRepository = require("../repositories/userRepository");
const { ApiError } = require("../utils/errors");
const { generateToken } = require("../utils/jwt");
const logger = require("../utils/logger");

class UserService {
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      // Check if email already exists
      const existingEmail = await userRepository.emailExists(userData.email);
      if (existingEmail) {
        throw new ApiError("Email already registered", 409);
      }

      // Check if username already exists
      const existingUsername = await userRepository.usernameExists(
        userData.username
      );
      if (existingUsername) {
        throw new ApiError("Username already taken", 409);
      }

      // Validate role-specific requirements
      await this._validateRoleSpecificData(userData);

      // Create user
      const user = await userRepository.create(userData);

      logger.info(`New user registered: ${user.email} with role: ${user.role}`);

      // Generate token
      const token = generateToken(user._id);

      return {
        user,
        token,
        message: "User registered successfully. Account is pending approval.",
      };
    } catch (error) {
      logger.error("User registration failed:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(identifier, password) {
    try {
      // Find user by email or username
      const user = await userRepository.findByEmailOrUsername(identifier, true);

      if (!user) {
        throw new ApiError("Invalid credentials", 401);
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new ApiError(
          "Account is temporarily locked due to multiple failed login attempts",
          423
        );
      }

      // Check if account is active
      if (user.status !== "active") {
        throw new ApiError(
          `Account is ${user.status}. Please contact administrator.`,
          403
        );
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw new ApiError("Invalid credentials", 401);
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      await userRepository.updateLastLogin(user._id);

      // Generate token
      const token = generateToken(user._id);

      logger.info(`User logged in: ${user.email}`);

      return {
        user,
        token,
        message: "Login successful",
      };
    } catch (error) {
      logger.error("User login failed:", error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      return user;
    } catch (error) {
      logger.error("Get user profile failed:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      const updatedUser = await userRepository.updateById(userId, updateData);

      logger.info(`User profile updated: ${updatedUser.email}`);

      return updatedUser;
    } catch (error) {
      logger.error("Update user profile failed:", error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await userRepository.findById(userId, true);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );

      if (!isCurrentPasswordValid) {
        throw new ApiError("Current password is incorrect", 400);
      }

      // Update password
      await userRepository.updateById(userId, { password: newPassword });

      logger.info(`Password changed for user: ${user.email}`);

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error("Change password failed:", error);
      throw error;
    }
  }

  /**
   * Get users list (Admin only)
   */
  async getUsers(options) {
    try {
      const result = await userRepository.findWithFilters({}, options);
      return result;
    } catch (error) {
      logger.error("Get users list failed:", error);
      throw error;
    }
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      return user;
    } catch (error) {
      logger.error("Get user by ID failed:", error);
      throw error;
    }
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(userId, status, updatedBy) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      const updatedUser = await userRepository.updateById(userId, { status });

      logger.info(
        `User status updated: ${user.email} -> ${status} by ${updatedBy}`
      );

      return updatedUser;
    } catch (error) {
      logger.error("Update user status failed:", error);
      throw error;
    }
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId, role, updatedBy) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      const updatedUser = await userRepository.updateById(userId, { role });

      logger.info(
        `User role updated: ${user.email} -> ${role} by ${updatedBy}`
      );

      return updatedUser;
    } catch (error) {
      logger.error("Update user role failed:", error);
      throw error;
    }
  }

  /**
   * Update user permissions (Admin only)
   */
  async updateUserPermissions(userId, permissions, updatedBy) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      const updatedUser = await userRepository.updateById(userId, {
        permissions,
      });

      logger.info(`User permissions updated: ${user.email} by ${updatedBy}`);

      return updatedUser;
    } catch (error) {
      logger.error("Update user permissions failed:", error);
      throw error;
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId, deletedBy) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      await userRepository.deleteById(userId);

      logger.info(`User deleted: ${user.email} by ${deletedBy}`);

      return { message: "User deleted successfully" };
    } catch (error) {
      logger.error("Delete user failed:", error);
      throw error;
    }
  }

  /**
   * Get user statistics (Admin only)
   */
  async getUserStatistics() {
    try {
      const stats = await userRepository.getUserStats();
      const recentUsers = await userRepository.getRecentUsers(7, 5);

      return {
        roleStats: stats,
        recentUsers,
        totalUsers: stats.reduce((acc, stat) => acc + stat.total, 0),
      };
    } catch (error) {
      logger.error("Get user statistics failed:", error);
      throw error;
    }
  }

  /**
   * Advanced user search (Admin only)
   */
  async advancedSearch(searchParams) {
    try {
      const result = await userRepository.advancedSearch(searchParams);
      return result;
    } catch (error) {
      logger.error("Advanced user search failed:", error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role, status = "active") {
    try {
      const users = await userRepository.findByRole(role, status);
      return users;
    } catch (error) {
      logger.error("Get users by role failed:", error);
      throw error;
    }
  }

  /**
   * Bulk update user status (Admin only)
   */
  async bulkUpdateStatus(userIds, status, updatedBy) {
    try {
      const result = await userRepository.bulkUpdate(
        { _id: { $in: userIds } },
        { status }
      );

      logger.info(
        `Bulk status update: ${result.modifiedCount} users updated to ${status} by ${updatedBy}`
      );

      return {
        message: `${result.modifiedCount} users updated successfully`,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      logger.error("Bulk update user status failed:", error);
      throw error;
    }
  }

  /**
   * Reset expired account locks
   */
  async resetExpiredLocks() {
    try {
      const result = await userRepository.resetExpiredLocks();

      if (result.modifiedCount > 0) {
        logger.info(`Reset ${result.modifiedCount} expired account locks`);
      }

      return result;
    } catch (error) {
      logger.error("Reset expired locks failed:", error);
      throw error;
    }
  }

  /**
   * Validate role-specific data during registration
   */
  async _validateRoleSpecificData(userData) {
    const { role, organizationDetails } = userData;

    switch (role) {
      case "bus_operator":
        if (!organizationDetails?.operatorLicense) {
          throw new ApiError(
            "Operator license is required for bus operators",
            400
          );
        }
        if (!organizationDetails?.companyName) {
          throw new ApiError("Company name is required for bus operators", 400);
        }
        break;

      case "ntc_admin":
        if (!organizationDetails?.employeeId) {
          throw new ApiError(
            "Employee ID is required for NTC administrators",
            400
          );
        }
        break;
    }
  }
}

module.exports = new UserService();
