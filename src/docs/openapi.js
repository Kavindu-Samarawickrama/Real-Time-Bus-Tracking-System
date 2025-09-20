// src/docs/openapi.js
const openapiSpecification = {
  openapi: "3.0.0",
  info: {
    title: "NTC Bus Tracking API",
    description:
      "API for National Transport Commission - Real-Time Bus Tracking System. Includes user management, authentication, admin features, and route management.",
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
      Route: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Route ID" },
          routeNumber: {
            type: "string",
            description: "Unique route number (letters, numbers, hyphens)",
          },
          routeName: { type: "string", description: "Route name" },
          origin: {
            type: "object",
            properties: {
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
              coordinates: {
                type: "object",
                properties: {
                  latitude: {
                    type: "number",
                    minimum: 5.9,
                    maximum: 9.9,
                  },
                  longitude: {
                    type: "number",
                    minimum: 79.6,
                    maximum: 81.9,
                  },
                },
              },
              terminalName: { type: "string" },
            },
          },
          destination: {
            type: "object",
            properties: {
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
              coordinates: {
                type: "object",
                properties: {
                  latitude: {
                    type: "number",
                    minimum: 5.9,
                    maximum: 9.9,
                  },
                  longitude: {
                    type: "number",
                    minimum: 79.6,
                    maximum: 81.9,
                  },
                },
              },
              terminalName: { type: "string" },
            },
          },
          waypoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                city: { type: "string" },
                coordinates: {
                  type: "object",
                  properties: {
                    latitude: {
                      type: "number",
                      minimum: 5.9,
                      maximum: 9.9,
                    },
                    longitude: {
                      type: "number",
                      minimum: 79.6,
                      maximum: 81.9,
                    },
                  },
                },
                estimatedTravelTime: { type: "number" },
                stopOrder: { type: "number", minimum: 1 },
                stopDuration: { type: "number", minimum: 0 },
              },
            },
          },
          distance: { type: "number", description: "Distance in kilometers" },
          estimatedDuration: {
            type: "number",
            description: "Estimated duration in minutes",
          },
          operatingHours: {
            type: "object",
            properties: {
              firstDeparture: {
                type: "string",
                description: "HH:MM format",
              },
              lastDeparture: {
                type: "string",
                description: "HH:MM format",
              },
              frequency: {
                type: "number",
                description: "Minutes between departures",
              },
            },
          },
          routeType: {
            type: "string",
            enum: ["express", "semi_express", "normal", "luxury"],
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "maintenance"],
          },
          operatedBy: {
            type: "array",
            items: { type: "string", description: "User ID of operator" },
          },
          createdBy: { type: "string", description: "User ID of creator" },
          lastModifiedBy: {
            type: "string",
            description: "User ID of last modifier",
          },
          fare: {
            type: "object",
            properties: {
              baseFare: { type: "number" },
              currency: { type: "string", enum: ["LKR"] },
            },
          },
          amenities: {
            type: "object",
            properties: {
              airConditioned: { type: "boolean" },
              wifi: { type: "boolean" },
              chargingPorts: { type: "boolean" },
              restroom: { type: "boolean" },
              entertainment: { type: "boolean" },
            },
          },
          weeklySchedule: {
            type: "object",
            properties: {
              monday: { type: "boolean" },
              tuesday: { type: "boolean" },
              wednesday: { type: "boolean" },
              thursday: { type: "boolean" },
              friday: { type: "boolean" },
              saturday: { type: "boolean" },
              sunday: { type: "boolean" },
            },
          },
          statistics: {
            type: "object",
            properties: {
              totalTrips: { type: "number" },
              totalBuses: { type: "number" },
              averageRating: { type: "number", minimum: 0, maximum: 5 },
              lastActiveDate: { type: "string", format: "date-time" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          routeSummary: { type: "string", description: "Summary of the route" },
          isInterProvincial: { type: "boolean" },
        },
      },
      CreateRouteRequest: {
        type: "object",
        required: [
          "routeNumber",
          "routeName",
          "origin",
          "destination",
          "distance",
          "estimatedDuration",
          "operatingHours",
          "operatedBy",
          "fare",
        ],
        properties: {
          routeNumber: {
            type: "string",
            pattern: "^[A-Z0-9-]+$",
            maxLength: 20,
          },
          routeName: { type: "string", maxLength: 100 },
          origin: {
            type: "object",
            required: ["city", "province", "coordinates"],
            properties: {
              city: { type: "string", maxLength: 50 },
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
              coordinates: {
                type: "object",
                required: ["latitude", "longitude"],
                properties: {
                  latitude: {
                    type: "number",
                    minimum: 5.9,
                    maximum: 9.9,
                  },
                  longitude: {
                    type: "number",
                    minimum: 79.6,
                    maximum: 81.9,
                  },
                },
              },
              terminalName: { type: "string", maxLength: 100 },
            },
          },
          destination: {
            type: "object",
            required: ["city", "province", "coordinates"],
            properties: {
              city: { type: "string", maxLength: 50 },
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
              coordinates: {
                type: "object",
                required: ["latitude", "longitude"],
                properties: {
                  latitude: {
                    type: "number",
                    minimum: 5.9,
                    maximum: 9.9,
                  },
                  longitude: {
                    type: "number",
                    minimum: 79.6,
                    maximum: 81.9,
                  },
                },
              },
              terminalName: { type: "string", maxLength: 100 },
            },
          },
          waypoints: {
            type: "array",
            items: {
              type: "object",
              required: [
                "name",
                "coordinates",
                "estimatedTravelTime",
                "stopOrder",
              ],
              properties: {
                name: { type: "string", maxLength: 50 },
                city: { type: "string", maxLength: 50 },
                coordinates: {
                  type: "object",
                  required: ["latitude", "longitude"],
                  properties: {
                    latitude: {
                      type: "number",
                      minimum: 5.9,
                      maximum: 9.9,
                    },
                    longitude: {
                      type: "number",
                      minimum: 79.6,
                      maximum: 81.9,
                    },
                  },
                },
                estimatedTravelTime: { type: "number", minimum: 0 },
                stopOrder: { type: "number", minimum: 1 },
                stopDuration: { type: "number", minimum: 0, maximum: 60 },
              },
            },
          },
          distance: { type: "number", minimum: 1 },
          estimatedDuration: { type: "number", minimum: 10 },
          operatingHours: {
            type: "object",
            required: ["firstDeparture", "lastDeparture", "frequency"],
            properties: {
              firstDeparture: {
                type: "string",
                pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
              },
              lastDeparture: {
                type: "string",
                pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
              },
              frequency: { type: "number", minimum: 15, maximum: 480 },
            },
          },
          routeType: {
            type: "string",
            enum: ["express", "semi_express", "normal", "luxury"],
            default: "normal",
          },
          operatedBy: {
            type: "array",
            items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            minItems: 1,
          },
          fare: {
            type: "object",
            required: ["baseFare"],
            properties: {
              baseFare: { type: "number", minimum: 0 },
              currency: { type: "string", enum: ["LKR"], default: "LKR" },
            },
          },
          amenities: {
            type: "object",
            properties: {
              airConditioned: { type: "boolean", default: false },
              wifi: { type: "boolean", default: false },
              chargingPorts: { type: "boolean", default: false },
              restroom: { type: "boolean", default: false },
              entertainment: { type: "boolean", default: false },
            },
          },
          weeklySchedule: {
            type: "object",
            properties: {
              monday: { type: "boolean", default: true },
              tuesday: { type: "boolean", default: true },
              wednesday: { type: "boolean", default: true },
              thursday: { type: "boolean", default: true },
              friday: { type: "boolean", default: true },
              saturday: { type: "boolean", default: true },
              sunday: { type: "boolean", default: true },
            },
          },
        },
      },
      UpdateRouteRequest: {
        type: "object",
        properties: {
          routeName: { type: "string", maxLength: 100 },
          origin: {
            $ref: "#/components/schemas/CreateRouteRequest/properties/origin",
          },
          destination: {
            $ref: "#/components/schemas/CreateRouteRequest/properties/destination",
          },
          waypoints: {
            $ref: "#/components/schemas/CreateRouteRequest/properties/waypoints",
          },
          distance: { type: "number", minimum: 1 },
          estimatedDuration: { type: "number", minimum: 10 },
          operatingHours: {
            $ref: "#/components/schemas/CreateRouteRequest/properties/operatingHours",
          },
          routeType: {
            type: "string",
            enum: ["express", "semi_express", "normal", "luxury"],
          },
          operatedBy: {
            type: "array",
            items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            minItems: 1,
          },
          fare: {
            $ref: "#/components/schemas/CreateRouteRequest/properties/fare",
          },
          amenities: {
            $ref: "#/components/schemas/CreateRouteRequest/properties/amenities",
          },
          weeklySchedule: {
            $ref: "#/components/schemas/CreateRouteRequest/properties/weeklySchedule",
          },
        },
        minProperties: 1,
      },
      UpdateRouteStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "maintenance"],
          },
          reason: { type: "string", maxLength: 500 },
        },
      },
      RouteQueryRequest: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          routeType: {
            type: "string",
            enum: ["express", "semi_express", "normal", "luxury"],
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "maintenance"],
          },
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
          search: { type: "string" },
          originCity: { type: "string" },
          destinationCity: { type: "string" },
          routeNumber: { type: "string" },
          operatedBy: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          sortBy: {
            type: "string",
            enum: [
              "createdAt",
              "routeNumber",
              "routeName",
              "distance",
              "estimatedDuration",
              "fare.baseFare",
            ],
            default: "createdAt",
          },
          sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
          interProvincialOnly: { type: "boolean" },
          amenities: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "airConditioned",
                "wifi",
                "chargingPorts",
                "restroom",
                "entertainment",
              ],
            },
          },
        },
      },
      RouteSearchRequest: {
        type: "object",
        properties: {
          origin: {
            oneOf: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  latitude: { type: "number", minimum: 5.9, maximum: 9.9 },
                  longitude: { type: "number", minimum: 79.6, maximum: 81.9 },
                },
              },
            ],
          },
          destination: {
            oneOf: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  latitude: { type: "number", minimum: 5.9, maximum: 9.9 },
                  longitude: { type: "number", minimum: 79.6, maximum: 81.9 },
                },
              },
            ],
          },
          travelDate: { type: "string", format: "date" },
          routeType: {
            type: "string",
            enum: ["express", "semi_express", "normal", "luxury"],
          },
          maxDistance: { type: "number", minimum: 1 },
          maxDuration: { type: "number", minimum: 10 },
          amenities: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "airConditioned",
                "wifi",
                "chargingPorts",
                "restroom",
                "entertainment",
              ],
            },
          },
          maxFare: { type: "number", minimum: 0 },
        },
      },
      BulkUpdateRouteStatusRequest: {
        type: "object",
        required: ["routeIds", "status"],
        properties: {
          routeIds: {
            type: "array",
            items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            minItems: 1,
            maxItems: 50,
          },
          status: {
            type: "string",
            enum: ["active", "inactive", "suspended", "maintenance"],
          },
          reason: { type: "string", maxLength: 500 },
        },
      },
      RouteSummaryResponse: {
        type: "object",
        properties: {
          routes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                routeNumber: { type: "string" },
                routeName: { type: "string" },
                origin: { type: "string" },
                destination: { type: "string" },
                routeType: {
                  type: "string",
                  enum: ["express", "semi_express", "normal", "luxury"],
                },
                status: {
                  type: "string",
                  enum: ["active", "inactive", "suspended", "maintenance"],
                },
                distance: { type: "number" },
                baseFare: { type: "number" },
                isInterProvincial: { type: "boolean" },
                operatorCount: { type: "number" },
              },
            },
          },
          totalRoutes: { type: "number" },
          summary: {
            type: "object",
            properties: {
              byType: { type: "object" },
              byStatus: { type: "object" },
              interProvincial: { type: "number" },
              intraProvincial: { type: "number" },
            },
          },
        },
      },
      RouteSchedulesResponse: {
        type: "object",
        properties: {
          route: { type: "string", description: "Route summary" },
          date: { type: "string", format: "date" },
          operatesOnThisDay: { type: "boolean" },
          schedules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                departureTime: { type: "string", description: "HH:MM format" },
                estimatedArrivalTime: {
                  type: "string",
                  description: "HH:MM format",
                },
                journeyDurationMinutes: { type: "number" },
              },
            },
          },
          totalDepartures: { type: "number" },
        },
      },
      ValidateRouteDataResponse: {
        type: "object",
        properties: {
          valid: { type: "boolean" },
          validations: {
            type: "object",
            properties: {
              routeNumberAvailable: { type: "boolean" },
              operatorsValid: { type: "boolean" },
              coordinatesValid: { type: "boolean" },
              scheduleValid: { type: "boolean" },
            },
          },
          data: { $ref: "#/components/schemas/CreateRouteRequest" },
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
    "/routes": {
      get: {
        summary: "Get all routes",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            description: "Items per page",
          },
          {
            name: "routeType",
            in: "query",
            schema: {
              type: "string",
              enum: ["express", "semi_express", "normal", "luxury"],
            },
            description: "Filter by route type",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended", "maintenance"],
            },
            description: "Filter by status",
          },
          {
            name: "province",
            in: "query",
            schema: {
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
            description: "Filter by province",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search term",
          },
          {
            name: "originCity",
            in: "query",
            schema: { type: "string" },
            description: "Filter by origin city",
          },
          {
            name: "destinationCity",
            in: "query",
            schema: { type: "string" },
            description: "Filter by destination city",
          },
          {
            name: "routeNumber",
            in: "query",
            schema: { type: "string" },
            description: "Filter by route number",
          },
          {
            name: "operatedBy",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by operator ID",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "createdAt",
                "routeNumber",
                "routeName",
                "distance",
                "estimatedDuration",
                "fare.baseFare",
              ],
            },
            description: "Sort field",
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
            description: "Sort order",
          },
          {
            name: "interProvincialOnly",
            in: "query",
            schema: { type: "boolean" },
            description: "Filter for inter-provincial routes only",
          },
          {
            name: "amenities",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "airConditioned",
                  "wifi",
                  "chargingPorts",
                  "restroom",
                  "entertainment",
                ],
              },
            },
            description: "Filter by amenities",
          },
        ],
        responses: {
          200: {
            description: "List of routes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
      post: {
        summary: "Create a new route (Admin or Operator only)",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRouteRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Route created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Route" },
                    message: { type: "string" },
                  },
                },
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
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/search/between-cities": {
      get: {
        summary: "Search routes between two cities",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "origin",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Origin city",
          },
          {
            name: "destination",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Destination city",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended", "maintenance"],
              default: "active",
            },
            description: "Filter by route status",
          },
        ],
        responses: {
          200: {
            description: "Routes found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
                  },
                },
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
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/search/nearby": {
      get: {
        summary: "Find nearby routes",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "latitude",
            in: "query",
            required: true,
            schema: { type: "number", minimum: 5.9, maximum: 9.9 },
            description: "Latitude within Sri Lanka bounds",
          },
          {
            name: "longitude",
            in: "query",
            required: true,
            schema: { type: "number", minimum: 79.6, maximum: 81.9 },
            description: "Longitude within Sri Lanka bounds",
          },
          {
            name: "maxDistance",
            in: "query",
            schema: { type: "integer", default: 50000 },
            description: "Maximum distance in meters",
          },
        ],
        responses: {
          200: {
            description: "Nearby routes found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
                  },
                },
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
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/inter-provincial": {
      get: {
        summary: "Get inter-provincial routes",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended", "maintenance"],
              default: "active",
            },
            description: "Filter by route status",
          },
        ],
        responses: {
          200: {
            description: "Inter-provincial routes retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
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
    "/routes/popular": {
      get: {
        summary: "Get popular routes",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Number of routes to return",
          },
        ],
        responses: {
          200: {
            description: "Popular routes retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
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
    "/routes/upcoming-departures": {
      get: {
        summary: "Get routes with upcoming departures",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Routes with upcoming departures retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
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
    "/routes/province/{province}": {
      get: {
        summary: "Get routes by province",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "province",
            in: "path",
            required: true,
            schema: {
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
            description: "Province name",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended", "maintenance"],
              default: "active",
            },
            description: "Filter by route status",
          },
        ],
        responses: {
          200: {
            description: "Routes for province retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid province",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/operator/{operatorId}": {
      get: {
        summary: "Get routes by operator (Admin or Operator only)",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "operatorId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Operator ID",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended", "maintenance"],
            },
            description: "Filter by route status",
          },
        ],
        responses: {
          200: {
            description: "Routes by operator retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid operator ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/my-routes": {
      get: {
        summary: "Get operator's own routes (Operator only)",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended", "maintenance"],
            },
            description: "Filter by route status",
          },
        ],
        responses: {
          200: {
            description: "Operator's routes retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
                  },
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
    "/routes/number/{routeNumber}": {
      get: {
        summary: "Get route by route number",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "routeNumber",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Route number",
          },
        ],
        responses: {
          200: {
            description: "Route retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Route" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid route number",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/{routeId}": {
      get: {
        summary: "Get route by ID",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "routeId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Route ID",
          },
        ],
        responses: {
          200: {
            description: "Route retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Route" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid route ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      put: {
        summary: "Update route (Admin or Operator only)",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "routeId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Route ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRouteRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Route updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Route" },
                    message: { type: "string" },
                  },
                },
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
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      delete: {
        summary: "Delete route (Admin only)",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "routeId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Route ID",
          },
        ],
        responses: {
          200: {
            description: "Route deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "null" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid route ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/{routeId}/departure-info": {
      get: {
        summary: "Get route with departure information",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "routeId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Route ID",
          },
        ],
        responses: {
          200: {
            description: "Route with departure info retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Route" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid route ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/{routeId}/schedules": {
      get: {
        summary: "Get route schedules for a specific date",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "routeId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Route ID",
          },
          {
            name: "date",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Date for schedules (YYYY-MM-DD)",
          },
        ],
        responses: {
          200: {
            description: "Route schedules retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      $ref: "#/components/schemas/RouteSchedulesResponse",
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid route ID or date",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          404: { description: "Route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/admin/summary": {
      get: {
        summary: "Get routes summary (Admin only)",
        tags: ["Admin Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["active", "inactive", "suspended", "maintenance"],
              default: "active",
            },
            description: "Filter by route status",
          },
          {
            name: "province",
            in: "query",
            schema: {
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
            description: "Filter by province",
          },
          {
            name: "routeType",
            in: "query",
            schema: {
              type: "string",
              enum: ["express", "semi_express", "normal", "luxury"],
            },
            description: "Filter by route type",
          },
        ],
        responses: {
          200: {
            description: "Routes summary retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/RouteSummaryResponse" },
                    message: { type: "string" },
                  },
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
    "/routes/search/advanced": {
      post: {
        summary: "Advanced route search",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RouteSearchRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Route" },
                    },
                    message: { type: "string" },
                  },
                },
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
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/validate": {
      post: {
        summary: "Validate route data (Admin or Operator only)",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRouteRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Route data validation completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      $ref: "#/components/schemas/ValidateRouteDataResponse",
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: false },
                    message: { type: "string" },
                    errors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { message: { type: "string" } },
                      },
                    },
                  },
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
    "/routes/{routeId}/status": {
      patch: {
        summary: "Update route status (Admin or Operator only)",
        tags: ["Routes"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "routeId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Route ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRouteStatusRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Route status updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Route" },
                    message: { type: "string" },
                  },
                },
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
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/routes/admin/statistics": {
      get: {
        summary: "Get route statistics (Admin only)",
        tags: ["Admin Routes"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Route statistics retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "object" },
                    message: { type: "string" },
                  },
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
    "/routes/admin/bulk/status": {
      put: {
        summary: "Bulk update route status (Admin only)",
        tags: ["Admin Routes"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BulkUpdateRouteStatusRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Route statuses updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "object" },
                    message: { type: "string" },
                  },
                },
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
    { name: "Routes", description: "Route management endpoints" },
    { name: "Admin Routes", description: "Admin route management endpoints" },
  ],
};

module.exports = openapiSpecification;
