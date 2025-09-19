// src/docs/openapi.js
const openapiSpecification = {
  openapi: "3.0.0",
  info: {
    title: "NTC Bus Tracking API",
    description:
      "API for National Transport Commission - Real-Time Bus Tracking System. Includes user management, authentication, and admin features.",
    version: process.env.API_VERSION || "v1",
    contact: {
      name: "NTC Development Team",
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}/api`,
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string", description: "User ID" },
          username: { type: "string", description: "Unique username" },
          email: { type: "string", description: "User email" },
          role: {
            type: "string",
            enum: ["ntc_admin", "bus_operator", "commuter"],
            description: "User role",
          },
          profile: {
            type: "object",
            properties: {
              firstName: { type: "string" },
              lastName: { type: "string" },
              phone: { type: "string" },
              address: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  province: {
                    type: "string",
                    enum: [
                      "Western",
                      "Central",
                      "Southern",
                      "Northern",
                      "Eastern",
                      "North Western",
                      "North Central",
                      "Uva",
                      "Sabaragamuwa",
                    ],
                  },
                  postalCode: { type: "string" },
                },
              },
            },
          },
          organizationDetails: {
            type: "object",
            properties: {
              operatorLicense: { type: "string" },
              companyName: { type: "string" },
              businessRegNumber: { type: "string" },
              employeeId: { type: "string" },
              department: { type: "string" },
              designation: { type: "string" },
            },
          },
          permissions: {
            type: "object",
            properties: {
              canManageRoutes: { type: "boolean" },
              canManageBuses: { type: "boolean" },
              canViewReports: { type: "boolean" },
              canManageUsers: { type: "boolean" },
              canTrackBuses: { type: "boolean" },
            },
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "pending"],
          },
          lastLogin: { type: "string", format: "date-time" },
          emailVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: [
          "username",
          "email",
          "password",
          "confirmPassword",
          "profile",
        ],
        properties: {
          username: { type: "string", minLength: 3, maxLength: 30 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          confirmPassword: { type: "string" },
          role: {
            type: "string",
            enum: ["ntc_admin", "bus_operator", "commuter"],
            default: "commuter",
          },
          profile: {
            type: "object",
            required: ["firstName", "lastName", "phone"],
            properties: {
              firstName: { type: "string", maxLength: 50 },
              lastName: { type: "string", maxLength: 50 },
              phone: { type: "string" },
              address: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  province: {
                    type: "string",
                    enum: [
                      "Western",
                      "Central",
                      "Southern",
                      "Northern",
                      "Eastern",
                      "North Western",
                      "North Central",
                      "Uva",
                      "Sabaragamuwa",
                    ],
                  },
                  postalCode: { type: "string" },
                },
              },
            },
          },
          organizationDetails: {
            type: "object",
            properties: {
              operatorLicense: { type: "string" },
              companyName: { type: "string" },
              businessRegNumber: { type: "string" },
              employeeId: { type: "string" },
              department: { type: "string" },
              designation: { type: "string" },
            },
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: { type: "string", description: "Email or username" },
          password: { type: "string" },
        },
      },
      UpdateProfileRequest: {
        type: "object",
        properties: {
          profile: {
            type: "object",
            properties: {
              firstName: { type: "string", maxLength: 50 },
              lastName: { type: "string", maxLength: 50 },
              phone: { type: "string" },
              address: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  province: {
                    type: "string",
                    enum: [
                      "Western",
                      "Central",
                      "Southern",
                      "Northern",
                      "Eastern",
                      "North Western",
                      "North Central",
                      "Uva",
                      "Sabaragamuwa",
                    ],
                  },
                  postalCode: { type: "string" },
                },
              },
            },
          },
          organizationDetails: {
            type: "object",
            properties: {
              companyName: { type: "string" },
              businessRegNumber: { type: "string" },
              department: { type: "string" },
              designation: { type: "string" },
            },
          },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword", "confirmNewPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string", minLength: 8 },
          confirmNewPassword: { type: "string" },
        },
      },
      AdminUpdateUserRequest: {
        type: "object",
        properties: {
          role: {
            type: "string",
            enum: ["ntc_admin", "bus_operator", "commuter"],
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "pending"],
          },
          permissions: {
            type: "object",
            properties: {
              canManageRoutes: { type: "boolean" },
              canManageBuses: { type: "boolean" },
              canViewReports: { type: "boolean" },
              canManageUsers: { type: "boolean" },
              canTrackBuses: { type: "boolean" },
            },
          },
        },
      },
      BulkUpdateStatusRequest: {
        type: "object",
        required: ["userIds", "status"],
        properties: {
          userIds: { type: "array", items: { type: "string" } },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "pending"],
          },
        },
      },
      AdvancedSearchRequest: {
        type: "object",
        properties: {
          // Assuming based on typical search; adjust if needed
          username: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
          status: { type: "string" },
          page: { type: "integer", default: 1 },
          limit: { type: "integer", default: 10 },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", default: false },
          message: { type: "string" },
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check endpoint",
        tags: ["System"],
        responses: {
          200: {
            description: "API health status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    timestamp: { type: "string" },
                    version: { type: "string" },
                    environment: { type: "string" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/info": {
      get: {
        summary: "API version info",
        tags: ["System"],
        responses: {
          200: {
            description: "API information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/": {
      get: {
        summary: "Root endpoint",
        tags: ["System"],
        responses: {
          200: {
            description: "Welcome message",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    version: { type: "string" },
                    documentation: { type: "string" },
                    health: { type: "string" },
                    timestamp: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/users/register": {
      post: {
        summary: "Register a new user",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/login": {
      post: {
        summary: "User login",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful, returns JWT token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/profile": {
      get: {
        summary: "Get user profile",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
      put: {
        summary: "Update user profile",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/change-password": {
      post: {
        summary: "Change password",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
            },
          },
        },
        responses: {
          200: { description: "Password changed" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/logout": {
      post: {
        summary: "Logout user",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Logged out" },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/permissions": {
      get: {
        summary: "Get user permissions",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User permissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    permissions: { type: "object" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users": {
      get: {
        summary: "Get all users (Admin only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer" },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer" },
            description: "Items per page",
          },
          {
            name: "role",
            in: "query",
            schema: { type: "string" },
            description: "Filter by role",
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string" },
            description: "Filter by status",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search term",
          },
          {
            name: "sortBy",
            in: "query",
            schema: { type: "string" },
            description: "Sort field",
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string" },
            description: "asc or desc",
          },
        ],
        responses: {
          200: {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/statistics": {
      get: {
        summary: "Get user statistics (Admin only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User statistics" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/search": {
      post: {
        summary: "Advanced user search (Admin only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdvancedSearchRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/role/{role}": {
      get: {
        summary: "Get users by role (Admin or Operator only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "role",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Users by role",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/{userId}": {
      get: {
        summary: "Get user by ID (Admin only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "User details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "User not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      put: {
        summary: "Update user (Admin only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdminUpdateUserRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "User updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "User not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      delete: {
        summary: "Delete user (Admin only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "User deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "User not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/users/bulk/status": {
      put: {
        summary: "Bulk update user status (Admin only)",
        tags: ["Admin Users"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkUpdateStatusRequest" },
            },
          },
        },
        responses: {
          200: { description: "Statuses updated" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
  },
  tags: [
    { name: "System", description: "System endpoints" },
    {
      name: "Users",
      description: "User authentication and profile management",
    },
    { name: "Admin Users", description: "Admin user management endpoints" },
  ],
};

module.exports = openapiSpecification;
