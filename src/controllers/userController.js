// src/controllers/userController.js
const userService = require("../services/userService");
const { validateSchema } = require("../middlewares/validation");
const {
  registerSchema,
  loginSchema,
  updateSchema,
  changePasswordSchema,
  adminUpdateUserSchema,
  userQuerySchema,
} = require("../validators/userValidator");
const { ApiError } = require("../utils/errors");
const { successResponse } = require("../utils/response");

class UserController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      console.log("Register request body:");
      const validatedData = await validateSchema(registerSchema, req.body);

      // Remove confirmPassword from data
      const { confirmPassword, ...userData } = validatedData;

      const result = await userService.register(userData);

      res
        .status(201)
        .json(successResponse(result, "User registered successfully", 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { identifier, password } = await validateSchema(
        loginSchema,
        req.body
      );

      const result = await userService.login(identifier, password);

      // Set token in HTTP-only cookie for production security
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json(successResponse(result, "Login successful"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      res.clearCookie("token");

      res.json(successResponse(null, "Logout successful"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);

      res.json(successResponse(user, "Profile retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(req, res, next) {
    try {
      const validatedData = await validateSchema(updateSchema, req.body);

      const user = await userService.updateProfile(req.user.id, validatedData);

      res.json(successResponse(user, "Profile updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = await validateSchema(
        changePasswordSchema,
        req.body
      );

      const result = await userService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users list (Admin only)
   */
  async getUsers(req, res, next) {
    try {
      const options = await validateSchema(userQuerySchema, req.query);

      const result = await userService.getUsers(options);

      res.json(successResponse(result, "Users retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid user ID format", 400);
      }

      const user = await userService.getUserById(userId);

      res.json(successResponse(user, "User retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid user ID format", 400);
      }

      const validatedData = await validateSchema(
        adminUpdateUserSchema,
        req.body
      );

      let result;

      if (validatedData.status) {
        result = await userService.updateUserStatus(
          userId,
          validatedData.status,
          req.user.email
        );
      }

      if (validatedData.role) {
        result = await userService.updateUserRole(
          userId,
          validatedData.role,
          req.user.email
        );
      }

      if (validatedData.permissions) {
        result = await userService.updateUserPermissions(
          userId,
          validatedData.permissions,
          req.user.email
        );
      }

      res.json(successResponse(result, "User updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError("Invalid user ID format", 400);
      }

      // Prevent self-deletion
      if (userId === req.user.id) {
        throw new ApiError("Cannot delete your own account", 403);
      }

      const result = await userService.deleteUser(userId, req.user.email);

      res.json(successResponse(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics (Admin only)
   */
  async getUserStatistics(req, res, next) {
    try {
      const stats = await userService.getUserStatistics();

      res.json(
        successResponse(stats, "User statistics retrieved successfully")
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Advanced user search (Admin only)
   */
  async advancedSearch(req, res, next) {
    try {
      const searchParams = req.body;

      const result = await userService.advancedSearch(searchParams);

      res.json(successResponse(result, "Search completed successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(req, res, next) {
    try {
      const { role } = req.params;
      const { status = "active" } = req.query;

      if (!["ntc_admin", "bus_operator", "commuter"].includes(role)) {
        throw new ApiError("Invalid role specified", 400);
      }

      const users = await userService.getUsersByRole(role, status);

      res.json(successResponse(users, `${role} users retrieved successfully`));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update user status (Admin only)
   */
  async bulkUpdateStatus(req, res, next) {
    try {
      const { userIds, status } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError("User IDs array is required", 400);
      }

      if (!["active", "inactive", "suspended", "pending"].includes(status)) {
        throw new ApiError("Invalid status specified", 400);
      }

      // Validate user ID formats
      const invalidIds = userIds.filter((id) => !id.match(/^[0-9a-fA-F]{24}$/));
      if (invalidIds.length > 0) {
        throw new ApiError("Invalid user ID format in the list", 400);
      }

      // Prevent updating own status
      if (userIds.includes(req.user.id)) {
        throw new ApiError("Cannot update your own status", 403);
      }

      const result = await userService.bulkUpdateStatus(
        userIds,
        status,
        req.user.email
      );

      res.json(successResponse(result, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user permissions
   */
  async getMyPermissions(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);

      res.json(
        successResponse(
          {
            permissions: user.permissions,
            role: user.role,
          },
          "Permissions retrieved successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
