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
      // url: `http://localhost:${process.env.PORT || 3000}/api`,
      url: `https://27a602eaabab.ngrok-free.app/api`,
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
      Bus: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Bus ID" },
          registrationNumber: {
            type: "string",
            description: "Unique bus registration number (e.g., WP-1234)",
          },
          permitNumber: {
            type: "string",
            description: "Unique route permit number",
          },
          vehicleDetails: {
            type: "object",
            properties: {
              make: { type: "string", description: "Vehicle make" },
              model: { type: "string", description: "Vehicle model" },
              year: { type: "integer", description: "Manufacturing year" },
              engineNumber: { type: "string", description: "Engine number" },
              chassisNumber: { type: "string", description: "Chassis number" },
              fuelType: {
                type: "string",
                enum: ["diesel", "petrol", "cng", "electric", "hybrid"],
                description: "Fuel type",
              },
              transmissionType: {
                type: "string",
                enum: ["manual", "automatic", "semi_automatic"],
                description: "Transmission type",
              },
            },
          },
          capacity: {
            type: "object",
            properties: {
              totalSeats: {
                type: "integer",
                description: "Total seat capacity",
              },
              standingCapacity: {
                type: "integer",
                description: "Standing capacity",
              },
              wheelchairAccessible: {
                type: "integer",
                description: "Wheelchair accessible seats",
              },
            },
          },
          dimensions: {
            type: "object",
            properties: {
              length: { type: "number", description: "Bus length in meters" },
              width: { type: "number", description: "Bus width in meters" },
              height: { type: "number", description: "Bus height in meters" },
            },
          },
          amenities: {
            type: "object",
            properties: {
              airConditioning: { type: "boolean" },
              wifi: { type: "boolean" },
              chargingPorts: { type: "boolean" },
              entertainment: { type: "boolean" },
              restroom: { type: "boolean" },
              recliningSeats: { type: "boolean" },
              luggageCompartment: { type: "boolean" },
              firstAidKit: { type: "boolean" },
              fireExtinguisher: { type: "boolean" },
              gpsTracking: { type: "boolean" },
              cctv: { type: "boolean" },
            },
          },
          operationalDetails: {
            type: "object",
            properties: {
              operator: {
                type: "string",
                description: "Operator ID (User reference)",
              },
              assignedRoute: {
                type: "string",
                description: "Assigned route ID (Route reference)",
              },
              currentDriver: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  licenseNumber: { type: "string" },
                  contactNumber: { type: "string" },
                },
              },
              conductor: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  contactNumber: { type: "string" },
                },
              },
            },
          },
          status: {
            type: "string",
            enum: [
              "active",
              "inactive",
              "maintenance",
              "out_of_service",
              "pending_approval",
            ],
            description: "Bus status",
          },
          location: {
            type: "object",
            properties: {
              current: {
                type: "object",
                properties: {
                  coordinates: {
                    type: "object",
                    properties: {
                      latitude: { type: "number" },
                      longitude: { type: "number" },
                    },
                  },
                  address: { type: "string" },
                  lastUpdated: { type: "string", format: "date-time" },
                  speed: { type: "number", description: "Speed in km/h" },
                  heading: {
                    type: "number",
                    description: "Heading in degrees",
                  },
                },
              },
              depot: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  coordinates: {
                    type: "object",
                    properties: {
                      latitude: { type: "number" },
                      longitude: { type: "number" },
                    },
                  },
                  address: { type: "string" },
                },
              },
            },
          },
          maintenance: {
            type: "object",
            properties: {
              lastService: { type: "string", format: "date-time" },
              nextServiceDue: { type: "string", format: "date-time" },
              serviceIntervalKm: { type: "integer" },
              currentMileage: { type: "integer" },
              fitnessExpiry: { type: "string", format: "date-time" },
              insuranceExpiry: { type: "string", format: "date-time" },
              emissionTestExpiry: { type: "string", format: "date-time" },
              maintenanceRecords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", format: "date-time" },
                    type: {
                      type: "string",
                      enum: ["routine", "repair", "inspection", "emergency"],
                    },
                    description: { type: "string" },
                    cost: { type: "number" },
                    performedBy: { type: "string" },
                    mileageAtService: { type: "integer" },
                  },
                },
              },
            },
          },
          compliance: {
            type: "object",
            properties: {
              routePermitExpiry: { type: "string", format: "date-time" },
              revenuePermitExpiry: { type: "string", format: "date-time" },
              ntcRegistrationExpiry: { type: "string", format: "date-time" },
              lastInspection: { type: "string", format: "date-time" },
              nextInspectionDue: { type: "string", format: "date-time" },
              violations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", format: "date-time" },
                    type: { type: "string" },
                    description: { type: "string" },
                    fine: { type: "number" },
                    status: {
                      type: "string",
                      enum: ["pending", "paid", "disputed", "waived"],
                    },
                  },
                },
              },
            },
          },
          statistics: {
            type: "object",
            properties: {
              totalTrips: { type: "integer" },
              totalKilometers: { type: "number" },
              averageSpeed: { type: "number" },
              fuelEfficiency: { type: "number" },
              lastTripDate: { type: "string", format: "date-time" },
              monthlyRevenue: { type: "number" },
              passengerCount: { type: "integer" },
              rating: {
                type: "object",
                properties: {
                  average: { type: "number" },
                  totalReviews: { type: "integer" },
                },
              },
            },
          },
          createdBy: { type: "string", description: "User ID of creator" },
          lastModifiedBy: {
            type: "string",
            description: "User ID of last modifier",
          },
          approvedBy: { type: "string", description: "User ID of approver" },
          approvedAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          totalCapacity: {
            type: "integer",
            description: "Total capacity (virtual)",
          },
          serviceDueStatus: {
            type: "string",
            enum: ["overdue", "due_soon", "current", "unknown"],
            description: "Service due status (virtual)",
          },
          complianceStatus: {
            type: "string",
            enum: ["expired", "expiring_soon", "compliant"],
            description: "Compliance status (virtual)",
          },
        },
      },
      CreateBusRequest: {
        type: "object",
        required: [
          "registrationNumber",
          "permitNumber",
          "vehicleDetails",
          "capacity",
          "dimensions",
          "operationalDetails",
          "maintenance",
          "compliance",
        ],
        properties: {
          registrationNumber: {
            type: "string",
            pattern: "^[A-Z]{2,3}-\\d{4}$",
            description: "Sri Lankan registration number (e.g., WP-1234)",
          },
          permitNumber: {
            type: "string",
            description: "Unique route permit number",
          },
          vehicleDetails: {
            $ref: "#/components/schemas/Bus/properties/vehicleDetails",
          },
          capacity: { $ref: "#/components/schemas/Bus/properties/capacity" },
          dimensions: {
            $ref: "#/components/schemas/Bus/properties/dimensions",
          },
          amenities: { $ref: "#/components/schemas/Bus/properties/amenities" },
          operationalDetails: {
            $ref: "#/components/schemas/Bus/properties/operationalDetails",
          },
          location: { $ref: "#/components/schemas/Bus/properties/location" },
          maintenance: {
            $ref: "#/components/schemas/Bus/properties/maintenance",
          },
          compliance: {
            $ref: "#/components/schemas/Bus/properties/compliance",
          },
        },
      },
      UpdateBusRequest: {
        type: "object",
        properties: {
          permitNumber: { type: "string" },
          vehicleDetails: {
            $ref: "#/components/schemas/Bus/properties/vehicleDetails",
          },
          capacity: { $ref: "#/components/schemas/Bus/properties/capacity" },
          dimensions: {
            $ref: "#/components/schemas/Bus/properties/dimensions",
          },
          amenities: { $ref: "#/components/schemas/Bus/properties/amenities" },
          operationalDetails: {
            $ref: "#/components/schemas/Bus/properties/operationalDetails",
          },
          location: { $ref: "#/components/schemas/Bus/properties/location" },
          maintenance: {
            $ref: "#/components/schemas/Bus/properties/maintenance",
          },
          compliance: {
            $ref: "#/components/schemas/Bus/properties/compliance",
          },
        },
        minProperties: 1,
      },
      UpdateBusStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: [
              "active",
              "inactive",
              "maintenance",
              "out_of_service",
              "pending_approval",
            ],
          },
          reason: { type: "string", maxLength: 500 },
        },
      },
      UpdateLocationRequest: {
        type: "object",
        required: ["coordinates"],
        properties: {
          coordinates: {
            type: "object",
            required: ["latitude", "longitude"],
            properties: {
              latitude: { type: "number", minimum: 5.9, maximum: 9.9 },
              longitude: { type: "number", minimum: 79.6, maximum: 81.9 },
            },
          },
          address: { type: "string" },
          speed: { type: "number", minimum: 0, maximum: 120 },
          heading: { type: "number", minimum: 0, maximum: 359 },
        },
      },
      BusQueryRequest: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          status: {
            type: "string",
            enum: [
              "active",
              "inactive",
              "maintenance",
              "out_of_service",
              "pending_approval",
            ],
          },
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          search: { type: "string" },
          registrationNumber: { type: "string" },
          make: { type: "string" },
          model: { type: "string" },
          minSeats: { type: "integer", minimum: 10 },
          maxSeats: { type: "integer", maximum: 80 },
          amenities: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "airConditioning",
                "wifi",
                "chargingPorts",
                "entertainment",
                "restroom",
                "recliningSeats",
                "gpsTracking",
                "cctv",
              ],
            },
          },
          fuelType: {
            type: "string",
            enum: ["diesel", "petrol", "cng", "electric", "hybrid"],
          },
          transmissionType: {
            type: "string",
            enum: ["manual", "automatic", "semi_automatic"],
          },
          needsService: { type: "boolean" },
          expiring: { type: "boolean" },
          sortBy: {
            type: "string",
            enum: [
              "createdAt",
              "registrationNumber",
              "vehicleDetails.year",
              "capacity.totalSeats",
              "maintenance.currentMileage",
            ],
            default: "createdAt",
          },
          sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
        },
      },
      BusSearchRequest: {
        type: "object",
        properties: {
          location: {
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
          radius: { type: "number", minimum: 1, maximum: 100, default: 50 },
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          amenities: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "airConditioning",
                "wifi",
                "chargingPorts",
                "entertainment",
                "restroom",
                "recliningSeats",
                "gpsTracking",
                "cctv",
              ],
            },
          },
          minCapacity: { type: "integer", minimum: 10 },
          maxCapacity: { type: "integer", maximum: 120 },
          fuelType: {
            type: "string",
            enum: ["diesel", "petrol", "cng", "electric", "hybrid"],
          },
          status: {
            type: "string",
            enum: [
              "active",
              "inactive",
              "maintenance",
              "out_of_service",
              "pending_approval",
            ],
          },
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        },
      },
      AddMaintenanceRecordRequest: {
        type: "object",
        required: ["type", "description"],
        properties: {
          type: {
            type: "string",
            enum: ["routine", "repair", "inspection", "emergency"],
          },
          description: { type: "string", maxLength: 500 },
          cost: { type: "number", minimum: 0 },
          performedBy: { type: "string" },
          mileageAtService: { type: "integer", minimum: 0 },
          date: { type: "string", format: "date-time", default: "now" },
        },
      },
      BulkUpdateStatusRequest: {
        type: "object",
        required: ["busIds", "status"],
        properties: {
          busIds: {
            type: "array",
            items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            minItems: 1,
            maxItems: 50,
          },
          status: {
            type: "string",
            enum: [
              "active",
              "inactive",
              "maintenance",
              "out_of_service",
              "pending_approval",
            ],
          },
          reason: { type: "string", maxLength: 500 },
        },
      },
      AssignRouteRequest: {
        type: "object",
        required: ["routeId"],
        properties: {
          routeId: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          effectiveDate: { type: "string", format: "date-time" },
        },
      },
      UnassignRouteRequest: {
        type: "object",
        properties: {
          reason: { type: "string", maxLength: 500 },
        },
      },
      FleetStatsRequest: {
        type: "object",
        properties: {
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          dateFrom: { type: "string", format: "date-time" },
          dateTo: { type: "string", format: "date-time" },
        },
      },
      AssignPersonnelRequest: {
        type: "object",
        properties: {
          driver: {
            type: "object",
            properties: {
              name: { type: "string", maxLength: 100 },
              licenseNumber: { type: "string" },
              contactNumber: {
                type: "string",
                pattern: "^(\\+94|0)[0-9]{9}$",
              },
            },
          },
          conductor: {
            type: "object",
            properties: {
              name: { type: "string", maxLength: 100 },
              contactNumber: {
                type: "string",
                pattern: "^(\\+94|0)[0-9]{9}$",
              },
            },
          },
        },
        anyOf: [{ required: ["driver"] }, { required: ["conductor"] }],
      },
      TrackingDataRequest: {
        type: "object",
        required: ["coordinates", "speed", "heading"],
        properties: {
          coordinates: {
            type: "object",
            required: ["latitude", "longitude"],
            properties: {
              latitude: { type: "number", minimum: 5.9, maximum: 9.9 },
              longitude: { type: "number", minimum: 79.6, maximum: 81.9 },
            },
          },
          speed: { type: "number", minimum: 0, maximum: 120 },
          heading: { type: "number", minimum: 0, maximum: 359 },
          timestamp: { type: "string", format: "date-time", default: "now" },
          accuracy: { type: "number", minimum: 0 },
          altitude: { type: "number" },
        },
      },
      BusSummaryResponse: {
        type: "object",
        properties: {
          buses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                registrationNumber: { type: "string" },
                make: { type: "string" },
                model: { type: "string" },
                year: { type: "integer" },
                totalSeats: { type: "integer" },
                totalCapacity: { type: "integer" },
                status: {
                  type: "string",
                  enum: [
                    "active",
                    "inactive",
                    "maintenance",
                    "out_of_service",
                    "pending_approval",
                  ],
                },
                fuelType: {
                  type: "string",
                  enum: ["diesel", "petrol", "cng", "electric", "hybrid"],
                },
                assignedRoute: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    routeNumber: { type: "string" },
                    routeName: { type: "string" },
                  },
                  nullable: true,
                },
                operator: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    companyName: { type: "string" },
                    name: { type: "string" },
                  },
                },
                serviceDueStatus: {
                  type: "string",
                  enum: ["overdue", "due_soon", "current", "unknown"],
                },
                complianceStatus: {
                  type: "string",
                  enum: ["expired", "expiring_soon", "compliant"],
                },
              },
            },
          },
          totalBuses: { type: "integer" },
          summary: {
            type: "object",
            properties: {
              byStatus: { type: "object" },
              byFuelType: { type: "object" },
              needingService: { type: "integer" },
              complianceIssues: { type: "integer" },
              assigned: { type: "integer" },
              unassigned: { type: "integer" },
            },
          },
        },
      },
      ValidateBusDataResponse: {
        type: "object",
        properties: {
          valid: { type: "boolean" },
          validations: {
            type: "object",
            properties: {
              registrationNumberAvailable: { type: "boolean" },
              permitNumberAvailable: { type: "boolean" },
              operatorValid: { type: "boolean" },
              routeValid: { type: "boolean" },
              complianceValid: { type: "boolean" },
            },
          },
          data: { $ref: "#/components/schemas/CreateBusRequest" },
        },
      },
      BusTrackingResponse: {
        type: "object",
        properties: {
          busInfo: {
            type: "object",
            properties: {
              registrationNumber: { type: "string" },
              route: { $ref: "#/components/schemas/Route" },
              operator: { $ref: "#/components/schemas/User" },
              capacity: {
                $ref: "#/components/schemas/Bus/properties/capacity",
              },
              amenities: {
                $ref: "#/components/schemas/Bus/properties/amenities",
              },
            },
          },
          tracking: {
            type: "object",
            properties: {
              coordinates: {
                type: "object",
                properties: {
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                },
              },
              speed: { type: "number" },
              heading: { type: "number" },
              lastUpdated: { type: "string", format: "date-time" },
              address: { type: "string" },
            },
            nullable: true,
          },
          status: {
            type: "string",
            enum: [
              "active",
              "inactive",
              "maintenance",
              "out_of_service",
              "pending_approval",
            ],
          },
          message: { type: "string" },
        },
      },
      MultipleBusesTrackingResponse: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: { type: "string" },
            registrationNumber: { type: "string" },
            route: { $ref: "#/components/schemas/Route" },
            operator: { type: "string" },
            location: {
              $ref: "#/components/schemas/Bus/properties/location/properties/current",
            },
            status: {
              type: "string",
              enum: [
                "active",
                "inactive",
                "maintenance",
                "out_of_service",
                "pending_approval",
              ],
            },
            error: { type: "string" },
          },
        },
      },
      Trip: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Trip ID" },
          tripNumber: {
            type: "string",
            description: "Unique trip number (format: TRP-YYYYMMDD-XXX)",
            pattern: "^TRP-\\d{8}-\\d{3}$",
          },
          route: {
            type: "string",
            description: "Route ID (reference to Route)",
          },
          bus: { type: "string", description: "Bus ID (reference to Bus)" },
          operator: {
            type: "string",
            description: "Operator ID (reference to User)",
          },
          schedule: {
            type: "object",
            properties: {
              scheduledDeparture: { type: "string", format: "date-time" },
              scheduledArrival: { type: "string", format: "date-time" },
              estimatedDeparture: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              estimatedArrival: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              actualDeparture: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              actualArrival: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
            },
          },
          crew: {
            type: "object",
            properties: {
              driver: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100 },
                  licenseNumber: { type: "string" },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                    description: "Sri Lankan phone number",
                  },
                },
              },
              conductor: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100, nullable: true },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                    nullable: true,
                    description: "Sri Lankan phone number",
                  },
                },
                nullable: true,
              },
            },
          },
          capacity: {
            type: "object",
            properties: {
              totalSeats: { type: "integer", minimum: 10 },
              bookedSeats: { type: "integer", minimum: 0 },
              availableSeats: { type: "integer", minimum: 0 },
              standingPassengers: { type: "integer", minimum: 0 },
            },
          },
          status: {
            type: "string",
            enum: [
              "scheduled",
              "boarding",
              "departed",
              "in_transit",
              "delayed",
              "arrived",
              "completed",
              "cancelled",
            ],
          },
          tracking: {
            type: "object",
            properties: {
              currentLocation: {
                type: "object",
                properties: {
                  coordinates: {
                    type: "object",
                    properties: {
                      latitude: { type: "number", minimum: 5.9, maximum: 9.9 },
                      longitude: {
                        type: "number",
                        minimum: 79.6,
                        maximum: 81.9,
                      },
                    },
                  },
                  address: { type: "string", nullable: true },
                  lastUpdated: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                },
              },
              speed: { type: "number", minimum: 0, maximum: 120 },
              heading: { type: "number", minimum: 0, maximum: 359 },
              distanceFromOrigin: { type: "number", minimum: 0 },
              distanceToDestination: {
                type: "number",
                minimum: 0,
                nullable: true,
              },
              nextWaypoint: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  estimatedArrival: { type: "string", format: "date-time" },
                  distanceAway: { type: "number" },
                },
                nullable: true,
              },
            },
          },
          waypoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                waypointRef: { type: "string", description: "Waypoint ID" },
                name: { type: "string" },
                scheduledArrival: { type: "string", format: "date-time" },
                scheduledDeparture: { type: "string", format: "date-time" },
                estimatedArrival: {
                  type: "string",
                  format: "date-time",
                  nullable: true,
                },
                estimatedDeparture: {
                  type: "string",
                  format: "date-time",
                  nullable: true,
                },
                actualArrival: {
                  type: "string",
                  format: "date-time",
                  nullable: true,
                },
                actualDeparture: {
                  type: "string",
                  format: "date-time",
                  nullable: true,
                },
                status: {
                  type: "string",
                  enum: [
                    "pending",
                    "approaching",
                    "arrived",
                    "departed",
                    "skipped",
                  ],
                },
                passengerActivity: {
                  type: "object",
                  properties: {
                    boarded: { type: "integer", minimum: 0 },
                    alighted: { type: "integer", minimum: 0 },
                  },
                },
              },
            },
          },
          fare: {
            type: "object",
            properties: {
              baseFare: { type: "number", minimum: 0 },
              currency: { type: "string", enum: ["LKR"] },
              discounts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["student", "senior", "disabled", "promotional"],
                    },
                    percentage: { type: "number", minimum: 0, maximum: 100 },
                    amount: { type: "number", minimum: 0 },
                  },
                },
              },
            },
          },
          revenue: {
            type: "object",
            properties: {
              totalRevenue: { type: "number", minimum: 0 },
              ticketsSold: { type: "integer", minimum: 0 },
              averageFare: { type: "number", minimum: 0 },
              expenses: {
                type: "object",
                properties: {
                  fuel: { type: "number", minimum: 0 },
                  toll: { type: "number", minimum: 0 },
                  maintenance: { type: "number", minimum: 0 },
                  other: { type: "number", minimum: 0 },
                },
              },
            },
          },
          weather: {
            type: "object",
            properties: {
              conditions: {
                type: "string",
                enum: ["clear", "cloudy", "rainy", "stormy", "foggy"],
                nullable: true,
              },
              temperature: { type: "number", nullable: true },
              visibility: { type: "number", nullable: true },
            },
          },
          incidents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                timestamp: { type: "string", format: "date-time" },
                type: {
                  type: "string",
                  enum: [
                    "breakdown",
                    "accident",
                    "traffic_jam",
                    "road_closure",
                    "passenger_incident",
                    "fuel_shortage",
                    "other",
                  ],
                },
                description: { type: "string", maxLength: 500 },
                location: {
                  type: "object",
                  properties: {
                    coordinates: {
                      type: "object",
                      properties: {
                        latitude: { type: "number" },
                        longitude: { type: "number" },
                      },
                    },
                    address: { type: "string", nullable: true },
                  },
                },
                severity: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"],
                },
                resolved: { type: "boolean" },
                resolvedAt: {
                  type: "string",
                  format: "date-time",
                  nullable: true,
                },
                reportedBy: { type: "string", description: "User ID" },
              },
            },
          },
          notifications: {
            type: "object",
            properties: {
              passengerAlerts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "delay",
                        "route_change",
                        "cancellation",
                        "boarding",
                        "arrival",
                      ],
                    },
                    message: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                    sent: { type: "boolean" },
                  },
                },
              },
            },
          },
          ratings: {
            type: "object",
            properties: {
              overall: {
                type: "number",
                minimum: 1,
                maximum: 5,
                nullable: true,
              },
              punctuality: {
                type: "number",
                minimum: 1,
                maximum: 5,
                nullable: true,
              },
              comfort: {
                type: "number",
                minimum: 1,
                maximum: 5,
                nullable: true,
              },
              driverBehavior: {
                type: "number",
                minimum: 1,
                maximum: 5,
                nullable: true,
              },
              cleanliness: {
                type: "number",
                minimum: 1,
                maximum: 5,
                nullable: true,
              },
              totalRatings: { type: "integer", minimum: 0 },
              reviews: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    user: { type: "string", description: "User ID" },
                    rating: { type: "number", minimum: 1, maximum: 5 },
                    comment: { type: "string", nullable: true },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          metadata: {
            type: "object",
            properties: {
              tripType: {
                type: "string",
                enum: ["regular", "express", "luxury", "special"],
              },
              repeatPattern: {
                type: "string",
                enum: ["one_time", "daily", "weekly", "monthly"],
              },
              parentTrip: {
                type: "string",
                description: "Parent trip ID",
                nullable: true,
              },
              tags: { type: "array", items: { type: "string" } },
              priority: {
                type: "string",
                enum: ["low", "normal", "high", "urgent"],
              },
            },
          },
          createdBy: { type: "string", description: "User ID of creator" },
          lastModifiedBy: {
            type: "string",
            description: "User ID of last modifier",
            nullable: true,
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          duration: {
            type: "integer",
            description: "Trip duration in minutes",
            nullable: true,
          },
          occupancyPercentage: {
            type: "integer",
            description: "Occupancy percentage",
          },
          delay: { type: "integer", description: "Delay in minutes" },
          progressPercentage: {
            type: "integer",
            description: "Trip progress percentage",
          },
        },
      },
      CreateTripRequest: {
        type: "object",
        required: [
          "route",
          "bus",
          "operator",
          "schedule",
          "crew",
          "capacity",
          "fare",
        ],
        properties: {
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          bus: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          schedule: {
            type: "object",
            required: ["scheduledDeparture", "scheduledArrival"],
            properties: {
              scheduledDeparture: { type: "string", format: "date-time" },
              scheduledArrival: { type: "string", format: "date-time" },
            },
          },
          crew: {
            type: "object",
            required: ["driver"],
            properties: {
              driver: {
                type: "object",
                required: ["name", "licenseNumber", "contactNumber"],
                properties: {
                  name: { type: "string", maxLength: 100 },
                  licenseNumber: { type: "string" },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                  },
                },
              },
              conductor: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100 },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                  },
                },
              },
            },
          },
          capacity: {
            type: "object",
            required: ["totalSeats"],
            properties: {
              totalSeats: { type: "integer", minimum: 10 },
              bookedSeats: { type: "integer", minimum: 0, default: 0 },
              standingPassengers: { type: "integer", minimum: 0, default: 0 },
            },
          },
          fare: {
            type: "object",
            required: ["baseFare"],
            properties: {
              baseFare: { type: "number", minimum: 0 },
              currency: { type: "string", enum: ["LKR"], default: "LKR" },
              discounts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["student", "senior", "disabled", "promotional"],
                    },
                    percentage: { type: "number", minimum: 0, maximum: 100 },
                    amount: { type: "number", minimum: 0 },
                  },
                },
              },
            },
          },
          metadata: {
            type: "object",
            properties: {
              tripType: {
                type: "string",
                enum: ["regular", "express", "luxury", "special"],
                default: "regular",
              },
              repeatPattern: {
                type: "string",
                enum: ["one_time", "daily", "weekly", "monthly"],
                default: "one_time",
              },
              tags: { type: "array", items: { type: "string" } },
              priority: {
                type: "string",
                enum: ["low", "normal", "high", "urgent"],
                default: "normal",
              },
            },
          },
        },
      },
      UpdateTripRequest: {
        type: "object",
        properties: {
          schedule: {
            type: "object",
            properties: {
              scheduledDeparture: { type: "string", format: "date-time" },
              scheduledArrival: { type: "string", format: "date-time" },
              estimatedDeparture: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              estimatedArrival: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
            },
          },
          crew: {
            type: "object",
            properties: {
              driver: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100 },
                  licenseNumber: { type: "string" },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                  },
                },
              },
              conductor: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100 },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                  },
                },
              },
            },
          },
          capacity: {
            type: "object",
            properties: {
              totalSeats: { type: "integer", minimum: 10 },
              bookedSeats: { type: "integer", minimum: 0 },
              standingPassengers: { type: "integer", minimum: 0 },
            },
          },
          fare: {
            type: "object",
            properties: {
              baseFare: { type: "number", minimum: 0 },
              currency: { type: "string", enum: ["LKR"] },
              discounts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["student", "senior", "disabled", "promotional"],
                    },
                    percentage: { type: "number", minimum: 0, maximum: 100 },
                    amount: { type: "number", minimum: 0 },
                  },
                },
              },
            },
          },
          metadata: {
            type: "object",
            properties: {
              tripType: {
                type: "string",
                enum: ["regular", "express", "luxury", "special"],
              },
              repeatPattern: {
                type: "string",
                enum: ["one_time", "daily", "weekly", "monthly"],
              },
              tags: { type: "array", items: { type: "string" } },
              priority: {
                type: "string",
                enum: ["low", "normal", "high", "urgent"],
              },
            },
          },
        },
        minProperties: 1,
      },
      UpdateStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: [
              "scheduled",
              "boarding",
              "departed",
              "in_transit",
              "delayed",
              "arrived",
              "completed",
              "cancelled",
            ],
          },
          updateData: {
            type: "object",
            properties: {
              actualDeparture: { type: "string", format: "date-time" },
              actualArrival: { type: "string", format: "date-time" },
              estimatedDeparture: { type: "string", format: "date-time" },
              estimatedArrival: { type: "string", format: "date-time" },
            },
          },
        },
      },
      UpdateLocationRequest: {
        type: "object",
        required: ["coordinates"],
        properties: {
          coordinates: {
            type: "object",
            required: ["latitude", "longitude"],
            properties: {
              latitude: { type: "number", minimum: 5.9, maximum: 9.9 },
              longitude: { type: "number", minimum: 79.6, maximum: 81.9 },
            },
          },
          address: { type: "string" },
          speed: { type: "number", minimum: 0, maximum: 120 },
          heading: { type: "number", minimum: 0, maximum: 359 },
          distanceFromOrigin: { type: "number", minimum: 0 },
          distanceToDestination: { type: "number", minimum: 0 },
        },
      },
      LiveTrackingRequest: {
        type: "object",
        required: ["coordinates", "speed", "heading"],
        properties: {
          coordinates: {
            type: "object",
            required: ["latitude", "longitude"],
            properties: {
              latitude: { type: "number", minimum: 5.9, maximum: 9.9 },
              longitude: { type: "number", minimum: 79.6, maximum: 81.9 },
            },
          },
          speed: { type: "number", minimum: 0, maximum: 120 },
          heading: { type: "number", minimum: 0, maximum: 359 },
          timestamp: { type: "string", format: "date-time", default: "now" },
        },
      },
      TripQueryRequest: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          status: {
            type: "string",
            enum: [
              "scheduled",
              "boarding",
              "departed",
              "in_transit",
              "delayed",
              "arrived",
              "completed",
              "cancelled",
            ],
          },
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          bus: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          dateFrom: { type: "string", format: "date-time" },
          dateTo: { type: "string", format: "date-time" },
          tripNumber: { type: "string", pattern: "^TRP-\\d{8}-\\d{3}$" },
          sortBy: {
            type: "string",
            enum: [
              "schedule.scheduledDeparture",
              "tripNumber",
              "capacity.bookedSeats",
              "fare.baseFare",
            ],
            default: "schedule.scheduledDeparture",
          },
          sortOrder: { type: "string", enum: ["asc", "desc"], default: "asc" },
        },
      },
      TripSearchRequest: {
        type: "object",
        properties: {
          location: {
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
          radius: { type: "number", minimum: 1, maximum: 100, default: 50 },
          status: {
            type: "string",
            enum: [
              "scheduled",
              "boarding",
              "departed",
              "in_transit",
              "delayed",
              "arrived",
              "completed",
              "cancelled",
            ],
          },
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          bus: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          dateFrom: { type: "string", format: "date-time" },
          dateTo: { type: "string", format: "date-time" },
          minSeats: { type: "integer", minimum: 1 },
          maxSeats: { type: "integer", minimum: 1 },
          tripType: {
            type: "string",
            enum: ["regular", "express", "luxury", "special"],
          },
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        },
      },
      IncidentRequest: {
        type: "object",
        required: ["type", "description"],
        properties: {
          type: {
            type: "string",
            enum: [
              "breakdown",
              "accident",
              "traffic_jam",
              "road_closure",
              "passenger_incident",
              "fuel_shortage",
              "other",
            ],
          },
          description: { type: "string", maxLength: 500 },
          location: {
            type: "object",
            properties: {
              coordinates: {
                type: "object",
                properties: {
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                },
              },
              address: { type: "string" },
            },
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
          },
          timestamp: { type: "string", format: "date-time", default: "now" },
        },
      },
      UpdateWaypointRequest: {
        type: "object",
        required: ["waypointRef", "status"],
        properties: {
          waypointRef: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          status: {
            type: "string",
            enum: ["pending", "approaching", "arrived", "departed", "skipped"],
          },
          estimatedArrival: { type: "string", format: "date-time" },
          estimatedDeparture: { type: "string", format: "date-time" },
          actualArrival: { type: "string", format: "date-time" },
          actualDeparture: { type: "string", format: "date-time" },
          passengerActivity: {
            type: "object",
            properties: {
              boarded: { type: "integer", minimum: 0 },
              alighted: { type: "integer", minimum: 0 },
            },
          },
        },
      },
      PassengerActivityRequest: {
        type: "object",
        required: ["waypointRef", "passengerActivity"],
        properties: {
          waypointRef: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          passengerActivity: {
            type: "object",
            required: ["boarded", "alighted"],
            properties: {
              boarded: { type: "integer", minimum: 0 },
              alighted: { type: "integer", minimum: 0 },
            },
          },
        },
      },
      AddRatingRequest: {
        type: "object",
        required: ["rating"],
        properties: {
          rating: { type: "number", minimum: 1, maximum: 5 },
          comment: { type: "string", maxLength: 500 },
          punctuality: { type: "number", minimum: 1, maximum: 5 },
          comfort: { type: "number", minimum: 1, maximum: 5 },
          driverBehavior: { type: "number", minimum: 1, maximum: 5 },
          cleanliness: { type: "number", minimum: 1, maximum: 5 },
        },
      },
      UpdateRevenueRequest: {
        type: "object",
        properties: {
          totalRevenue: { type: "number", minimum: 0 },
          ticketsSold: { type: "integer", minimum: 0 },
          averageFare: { type: "number", minimum: 0 },
          expenses: {
            type: "object",
            properties: {
              fuel: { type: "number", minimum: 0 },
              toll: { type: "number", minimum: 0 },
              maintenance: { type: "number", minimum: 0 },
              other: { type: "number", minimum: 0 },
            },
          },
        },
        minProperties: 1,
      },
      GenerateScheduleRequest: {
        type: "object",
        required: [
          "route",
          "bus",
          "operator",
          "startDate",
          "endDate",
          "repeatPattern",
        ],
        properties: {
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          bus: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          repeatPattern: {
            type: "string",
            enum: ["daily", "weekly", "monthly"],
          },
          schedule: {
            type: "object",
            required: ["departureTime", "duration"],
            properties: {
              departureTime: { type: "string", format: "time" },
              duration: { type: "integer", minimum: 30 },
            },
          },
          crew: {
            type: "object",
            properties: {
              driver: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100 },
                  licenseNumber: { type: "string" },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                  },
                },
              },
              conductor: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 100 },
                  contactNumber: {
                    type: "string",
                    pattern: "^(\\+94|0)[0-9]{9}$",
                  },
                },
              },
            },
          },
          fare: {
            type: "object",
            properties: {
              baseFare: { type: "number", minimum: 0 },
              currency: { type: "string", enum: ["LKR"], default: "LKR" },
            },
          },
          metadata: {
            type: "object",
            properties: {
              tripType: {
                type: "string",
                enum: ["regular", "express", "luxury", "special"],
                default: "regular",
              },
              tags: { type: "array", items: { type: "string" } },
              priority: {
                type: "string",
                enum: ["low", "normal", "high", "urgent"],
                default: "normal",
              },
            },
          },
        },
      },
      BulkUpdateStatusRequest: {
        type: "object",
        required: ["tripIds", "status"],
        properties: {
          tripIds: {
            type: "array",
            items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            minItems: 1,
            maxItems: 50,
          },
          status: {
            type: "string",
            enum: [
              "scheduled",
              "boarding",
              "departed",
              "in_transit",
              "delayed",
              "arrived",
              "completed",
              "cancelled",
            ],
          },
          reason: { type: "string", maxLength: 500 },
        },
      },
      TripAnalyticsRequest: {
        type: "object",
        properties: {
          operator: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          route: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
          dateFrom: { type: "string", format: "date-time" },
          dateTo: { type: "string", format: "date-time" },
          status: {
            type: "string",
            enum: [
              "scheduled",
              "boarding",
              "departed",
              "in_transit",
              "delayed",
              "arrived",
              "completed",
              "cancelled",
            ],
          },
        },
      },
      Tracking: {
        type: "object",
        properties: {
          trackingId: {
            type: "string",
            pattern: "^TRK-\\d{8}-\\d{6}$",
            example: "TRK-20250930-171005",
            description: "Unique tracking ID (format: TRK-YYYYMMDD-HHMMSS)",
          },
          trip: {
            type: "string",
            format: "objectId",
            example: "60c72b2f9b1e8a1b8c8d4f56",
            description: "Reference to Trip document",
          },
          bus: {
            type: "string",
            format: "objectId",
            example: "60c72b2f9b1e8a1b8c8d4f57",
            description: "Reference to Bus document",
          },
          route: {
            type: "string",
            format: "objectId",
            example: "60c72b2f9b1e8a1b8c8d4f58",
            description: "Reference to Route document",
          },
          driver: {
            type: "object",
            properties: {
              name: { type: "string", example: "John Doe" },
              contactNumber: {
                type: "string",
                pattern: "^(\\+94|0)[0-9]{9}$",
                example: "+94123456789",
                description: "Sri Lankan phone number",
              },
              driverId: { type: "string", example: "DRV12345" },
            },
            required: ["name", "contactNumber"],
          },
          status: {
            type: "string",
            enum: [
              "active",
              "paused",
              "stopped",
              "completed",
              "emergency",
              "offline",
            ],
            default: "active",
            description: "Tracking session status",
          },
          realTimeData: {
            type: "object",
            properties: {
              currentLocation: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["Point"], default: "Point" },
                  coordinates: {
                    type: "array",
                    items: { type: "number" },
                    minItems: 2,
                    maxItems: 2,
                    example: [79.85, 6.93],
                    description:
                      "[longitude, latitude] within Sri Lanka bounds (lat: 5.9-9.9, lon: 79.6-81.9)",
                  },
                },
                required: ["type", "coordinates"],
              },
              speed: {
                type: "number",
                minimum: 0,
                maximum: 120,
                default: 0,
                description: "Speed in km/h",
              },
              heading: {
                type: "number",
                minimum: 0,
                maximum: 359,
                description: "Heading in degrees",
              },
              altitude: {
                type: "number",
                minimum: -100,
                maximum: 3000,
                description: "Altitude in meters",
              },
              accuracy: {
                type: "number",
                minimum: 0,
                default: 10,
                description: "GPS accuracy in meters",
              },
              timestamp: {
                type: "string",
                format: "date-time",
                description: "Location timestamp",
              },
              address: { type: "string", description: "Resolved address" },
            },
            required: ["currentLocation", "timestamp"],
          },
          routeProgress: {
            type: "object",
            properties: {
              distanceFromOrigin: {
                type: "number",
                minimum: 0,
                default: 0,
                description: "Distance from origin in km",
              },
              distanceToDestination: {
                type: "number",
                minimum: 0,
                description: "Distance to destination in km",
              },
              completionPercentage: {
                type: "number",
                minimum: 0,
                maximum: 100,
                default: 0,
                description: "Route completion percentage",
              },
              estimatedArrival: {
                type: "string",
                format: "date-time",
                description: "Estimated arrival time",
              },
              nextWaypoint: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  coordinates: {
                    type: "array",
                    items: { type: "number" },
                    minItems: 2,
                    maxItems: 2,
                  },
                  estimatedArrival: { type: "string", format: "date-time" },
                  distanceAway: {
                    type: "number",
                    description: "Distance to waypoint in km",
                  },
                },
              },
            },
          },
          geofences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: {
                  type: "string",
                  enum: [
                    "station",
                    "terminal",
                    "depot",
                    "waypoint",
                    "restricted_zone",
                  ],
                },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                  minItems: 2,
                  maxItems: 2,
                },
                radius: {
                  type: "number",
                  minimum: 10,
                  maximum: 5000,
                  description: "Radius in meters",
                },
                entered: { type: "boolean", default: false },
                enteredAt: { type: "string", format: "date-time" },
                exitedAt: { type: "string", format: "date-time" },
                alerts: {
                  type: "object",
                  properties: {
                    onEntry: { type: "boolean", default: true },
                    onExit: { type: "boolean", default: true },
                  },
                },
              },
              required: ["name", "type", "coordinates", "radius"],
            },
          },
          trackingHistory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                location: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["Point"], default: "Point" },
                    coordinates: {
                      type: "array",
                      items: { type: "number" },
                      minItems: 2,
                      maxItems: 2,
                    },
                  },
                },
                speed: { type: "number" },
                heading: { type: "number" },
                altitude: { type: "number" },
                accuracy: { type: "number" },
                timestamp: { type: "string", format: "date-time" },
                address: { type: "string" },
                distanceFromPrevious: {
                  type: "number",
                  description: "Distance from previous point in meters",
                },
                timeSinceLastUpdate: {
                  type: "number",
                  description: "Time since last update in seconds",
                },
              },
              required: ["timestamp"],
            },
          },
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                alertId: { type: "string" },
                type: {
                  type: "string",
                  enum: [
                    "speed_violation",
                    "route_deviation",
                    "geofence_entry",
                    "geofence_exit",
                    "emergency_button",
                    "engine_issue",
                    "fuel_low",
                    "maintenance_due",
                    "communication_loss",
                  ],
                },
                severity: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"],
                },
                message: { type: "string" },
                location: {
                  type: "object",
                  properties: {
                    coordinates: {
                      type: "array",
                      items: { type: "number" },
                      minItems: 2,
                      maxItems: 2,
                    },
                    address: { type: "string" },
                  },
                },
                timestamp: { type: "string", format: "date-time" },
                acknowledged: { type: "boolean", default: false },
                acknowledgedBy: { type: "string", format: "objectId" },
                acknowledgedAt: { type: "string", format: "date-time" },
                resolved: { type: "boolean", default: false },
                resolvedAt: { type: "string", format: "date-time" },
              },
              required: ["alertId", "type", "severity", "message"],
            },
          },
          emergencyData: {
            type: "object",
            properties: {
              panicButtonPressed: { type: "boolean", default: false },
              lastPanicAt: { type: "string", format: "date-time" },
              emergencyContacts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    relationship: { type: "string" },
                    notified: { type: "boolean", default: false },
                  },
                },
              },
              currentEmergency: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "accident",
                      "breakdown",
                      "medical",
                      "security",
                      "fire",
                      "other",
                    ],
                  },
                  description: { type: "string" },
                  reportedAt: { type: "string", format: "date-time" },
                  status: {
                    type: "string",
                    enum: ["active", "resolved", "escalated"],
                  },
                },
              },
            },
          },
          performance: {
            type: "object",
            properties: {
              averageSpeed: { type: "number", default: 0 },
              maxSpeed: { type: "number", default: 0 },
              totalDistance: {
                type: "number",
                default: 0,
                description: "Total distance in km",
              },
              totalDrivingTime: {
                type: "number",
                default: 0,
                description: "Total driving time in minutes",
              },
              fuelEfficiency: {
                type: "number",
                default: 0,
                description: "Fuel efficiency in km/liter",
              },
              stopTime: {
                type: "number",
                default: 0,
                description: "Total stop time in minutes",
              },
              routeDeviations: { type: "number", default: 0 },
              speedViolations: { type: "number", default: 0 },
            },
          },
          connectivity: {
            type: "object",
            properties: {
              lastHeartbeat: { type: "string", format: "date-time" },
              signalStrength: { type: "number", minimum: 0, maximum: 100 },
              deviceInfo: {
                type: "object",
                properties: {
                  deviceId: { type: "string" },
                  model: { type: "string" },
                  os: { type: "string" },
                  appVersion: { type: "string" },
                  batteryLevel: { type: "number", minimum: 0, maximum: 100 },
                },
              },
              connectionType: {
                type: "string",
                enum: ["4G", "3G", "2G", "WiFi", "Offline"],
                default: "4G",
              },
              isOnline: { type: "boolean", default: true },
              lastOnlineAt: { type: "string", format: "date-time" },
            },
          },
          settings: {
            type: "object",
            properties: {
              updateInterval: {
                type: "number",
                minimum: 10,
                maximum: 300,
                default: 30,
                description: "Update interval in seconds",
              },
              trackingAccuracy: {
                type: "string",
                enum: ["high", "medium", "low", "battery_saving"],
                default: "high",
              },
              alertsEnabled: { type: "boolean", default: true },
              shareLocation: { type: "boolean", default: true },
            },
          },
          metadata: {
            type: "object",
            properties: {
              startTime: { type: "string", format: "date-time" },
              endTime: { type: "string", format: "date-time" },
              totalDuration: {
                type: "number",
                description: "Total duration in minutes",
              },
              dataPoints: { type: "number", default: 0 },
              lastDataReceived: { type: "string", format: "date-time" },
              version: { type: "string", default: "1.0" },
            },
          },
          createdBy: {
            type: "string",
            format: "objectId",
            description: "Reference to User document",
          },
          currentDuration: {
            type: "number",
            description: "Virtual field for tracking duration in minutes",
          },
          isCurrentlyOnline: {
            type: "boolean",
            description: "Virtual field for online status",
          },
          inEmergency: {
            type: "boolean",
            description: "Virtual field for emergency status",
          },
        },
        required: [
          "trackingId",
          "trip",
          "bus",
          "route",
          "driver",
          "realTimeData",
          "metadata",
          "createdBy",
        ],
      },
      StartTrackingRequest: {
        type: "object",
        properties: {
          trip: {
            type: "string",
            format: "objectId",
            example: "60c72b2f9b1e8a1b8c8d4f56",
          },
          bus: {
            type: "string",
            format: "objectId",
            example: "60c72b2f9b1e8a1b8c8d4f57",
          },
          driver: {
            type: "object",
            properties: {
              name: { type: "string", maxLength: 100, example: "John Doe" },
              contactNumber: {
                type: "string",
                pattern: "^(\\+94|0)[0-9]{9}$",
                example: "+94123456789",
              },
              driverId: { type: "string", example: "DRV12345" },
            },
            required: ["name", "contactNumber"],
          },
          realTimeData: {
            type: "object",
            properties: {
              coordinates: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
                example: [79.85, 6.93],
              },
              speed: { type: "number", minimum: 0, maximum: 120 },
              heading: { type: "number", minimum: 0, maximum: 359 },
              altitude: { type: "number", minimum: -100, maximum: 3000 },
              accuracy: { type: "number", minimum: 0 },
              timestamp: { type: "string", format: "date-time" },
              address: { type: "string" },
            },
            required: ["coordinates", "timestamp"],
          },
          settings: {
            type: "object",
            properties: {
              updateInterval: {
                type: "number",
                minimum: 10,
                maximum: 300,
                default: 30,
              },
              trackingAccuracy: {
                type: "string",
                enum: ["high", "medium", "low", "battery_saving"],
                default: "high",
              },
              alertsEnabled: { type: "boolean", default: true },
              shareLocation: { type: "boolean", default: true },
            },
          },
        },
        required: ["trip", "bus", "driver", "realTimeData"],
      },
      UpdateLocationRequest: {
        type: "object",
        properties: {
          coordinates: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
            example: [79.85, 6.93],
          },
          speed: { type: "number", minimum: 0, maximum: 120 },
          heading: { type: "number", minimum: 0, maximum: 359 },
          altitude: { type: "number", minimum: -100, maximum: 3000 },
          accuracy: { type: "number", minimum: 0 },
          timestamp: { type: "string", format: "date-time" },
          address: { type: "string" },
        },
        required: ["coordinates", "timestamp"],
      },
      EmergencyRequest: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "accident",
              "breakdown",
              "medical",
              "security",
              "fire",
              "other",
            ],
          },
          description: { type: "string", maxLength: 500 },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            default: "critical",
          },
          location: {
            type: "object",
            properties: {
              coordinates: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
              },
              address: { type: "string" },
            },
          },
        },
        required: ["type", "description"],
      },
      AlertRequest: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "speed_violation",
              "route_deviation",
              "geofence_entry",
              "geofence_exit",
              "emergency_button",
              "engine_issue",
              "fuel_low",
              "maintenance_due",
              "communication_loss",
            ],
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          message: { type: "string", maxLength: 500 },
          location: {
            type: "object",
            properties: {
              coordinates: {
                type: "array",
                items: { type: "number" },
                minItems: 2,
                maxItems: 2,
              },
              address: { type: "string" },
            },
          },
          metadata: { type: "object" },
        },
        required: ["type", "severity", "message"],
      },
      UpdateSettingsRequest: {
        type: "object",
        properties: {
          updateInterval: {
            type: "number",
            minimum: 10,
            maximum: 300,
            description: "Update interval in seconds",
          },
          trackingAccuracy: {
            type: "string",
            enum: ["high", "medium", "low", "battery_saving"],
          },
          alertsEnabled: { type: "boolean" },
          shareLocation: { type: "boolean" },
        },
        minProperties: 1,
      },
      HeartbeatRequest: {
        type: "object",
        properties: {
          deviceInfo: {
            type: "object",
            properties: {
              deviceId: { type: "string" },
              model: { type: "string" },
              os: { type: "string" },
              appVersion: { type: "string" },
              batteryLevel: { type: "number", minimum: 0, maximum: 100 },
            },
          },
          signalStrength: { type: "number", minimum: 0, maximum: 100 },
          batteryLevel: { type: "number", minimum: 0, maximum: 100 },
          connectionType: {
            type: "string",
            enum: ["4G", "3G", "2G", "WiFi", "Offline"],
          },
        },
      },
      PauseResumeRequest: {
        type: "object",
        properties: {
          reason: { type: "string", maxLength: 200 },
        },
      },
      EmergencyResolutionRequest: {
        type: "object",
        properties: {
          resolution: { type: "string", maxLength: 500 },
          notes: { type: "string", maxLength: 1000 },
        },
        required: ["resolution"],
      },
      CleanupRequest: {
        type: "object",
        properties: {
          days: {
            type: "number",
            minimum: 7,
            maximum: 365,
            default: 30,
            description: "Days to retain data",
          },
          dryRun: { type: "boolean", default: false },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", default: true },
          message: { type: "string" },
          data: { type: "object" },
        },
        required: ["success", "message", "data"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", default: false },
          error: { type: "string" },
          message: { type: "string" },
        },
        required: ["success", "error", "message"],
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
    "/buses": {
      get: {
        summary: "Get all buses with filters",
        tags: ["Buses"],
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
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "active",
                "inactive",
                "maintenance",
                "out_of_service",
                "pending_approval",
              ],
            },
            description: "Filter by bus status",
          },
          {
            name: "operator",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by operator ID",
          },
          {
            name: "route",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by route ID",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search term",
          },
          {
            name: "registrationNumber",
            in: "query",
            schema: { type: "string" },
            description: "Filter by registration number",
          },
          {
            name: "make",
            in: "query",
            schema: { type: "string" },
            description: "Filter by vehicle make",
          },
          {
            name: "model",
            in: "query",
            schema: { type: "string" },
            description: "Filter by vehicle model",
          },
          {
            name: "minSeats",
            in: "query",
            schema: { type: "integer", minimum: 10 },
            description: "Minimum seat capacity",
          },
          {
            name: "maxSeats",
            in: "query",
            schema: { type: "integer", maximum: 80 },
            description: "Maximum seat capacity",
          },
          {
            name: "amenities",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "airConditioning",
                  "wifi",
                  "chargingPorts",
                  "entertainment",
                  "restroom",
                  "recliningSeats",
                  "gpsTracking",
                  "cctv",
                ],
              },
            },
            description: "Filter by amenities",
          },
          {
            name: "fuelType",
            in: "query",
            schema: {
              type: "string",
              enum: ["diesel", "petrol", "cng", "electric", "hybrid"],
            },
            description: "Filter by fuel type",
          },
          {
            name: "transmissionType",
            in: "query",
            schema: {
              type: "string",
              enum: ["manual", "automatic", "semi_automatic"],
            },
            description: "Filter by transmission type",
          },
          {
            name: "needsService",
            in: "query",
            schema: { type: "boolean" },
            description: "Filter buses needing service",
          },
          {
            name: "expiring",
            in: "query",
            schema: { type: "boolean" },
            description: "Filter buses with expiring permits",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "createdAt",
                "registrationNumber",
                "vehicleDetails.year",
                "capacity.totalSeats",
                "maintenance.currentMileage",
              ],
              default: "createdAt",
            },
            description: "Sort field",
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort order",
          },
        ],
        responses: {
          200: {
            description: "List of buses",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        buses: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Bus" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            totalBuses: { type: "integer" },
                            page: { type: "integer" },
                            limit: { type: "integer" },
                            totalPages: { type: "integer" },
                          },
                        },
                      },
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
        summary: "Create a new bus (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBusRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Bus created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
    "/buses/search/nearby": {
      get: {
        summary: "Find nearby buses",
        tags: ["Buses"],
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
            name: "radius",
            in: "query",
            schema: { type: "number", default: 50 },
            description: "Search radius in kilometers",
          },
        ],
        responses: {
          200: {
            description: "Nearby buses retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bus" },
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
    "/buses/operator/{operatorId}": {
      get: {
        summary: "Get buses by operator (Admin or Operator only)",
        tags: ["Buses"],
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
              enum: [
                "active",
                "inactive",
                "maintenance",
                "out_of_service",
                "pending_approval",
              ],
            },
            description: "Filter by bus status",
          },
        ],
        responses: {
          200: {
            description: "Buses by operator retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bus" },
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
    "/buses/route/{routeId}": {
      get: {
        summary: "Get buses by route",
        tags: ["Buses"],
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
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "active",
                "inactive",
                "maintenance",
                "out_of_service",
                "pending_approval",
              ],
              default: "active",
            },
            description: "Filter by bus status",
          },
        ],
        responses: {
          200: {
            description: "Buses by route retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bus" },
                    },
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
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/my-buses": {
      get: {
        summary: "Get operator's own buses (Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "active",
                "inactive",
                "maintenance",
                "out_of_service",
                "pending_approval",
              ],
            },
            description: "Filter by bus status",
          },
        ],
        responses: {
          200: {
            description: "Operator's buses retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bus" },
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
    "/buses/registration/{registrationNumber}": {
      get: {
        summary: "Get bus by registration number",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "registrationNumber",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Bus registration number",
          },
        ],
        responses: {
          200: {
            description: "Bus retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid registration number",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/maintenance/needing-service": {
      get: {
        summary: "Get buses needing service (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Buses needing service retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bus" },
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
    "/buses/compliance/expiring-permits": {
      get: {
        summary: "Get buses with expiring permits (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "days",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 365, default: 30 },
            description: "Number of days to check for expiring permits",
          },
        ],
        responses: {
          200: {
            description: "Buses with expiring permits retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bus" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid days parameter",
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
    "/buses/{busId}": {
      get: {
        summary: "Get bus by ID",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        responses: {
          200: {
            description: "Bus retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid bus ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      put: {
        summary: "Update bus (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateBusRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Bus updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      delete: {
        summary: "Delete bus (Admin only)",
        tags: ["Admin Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        responses: {
          200: {
            description: "Bus deleted",
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
            description: "Invalid bus ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/tracking": {
      get: {
        summary: "Get bus live tracking data",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        responses: {
          200: {
            description: "Bus tracking data retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/BusTrackingResponse" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid bus ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/maintenance/history": {
      get: {
        summary: "Get bus maintenance history (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        responses: {
          200: {
            description: "Maintenance history retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Bus/properties/maintenance/properties/maintenanceRecords/items",
                      },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid bus ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/search/advanced": {
      post: {
        summary: "Advanced bus search",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BusSearchRequest" },
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
                      type: "object",
                      properties: {
                        buses: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Bus" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            totalBuses: { type: "integer" },
                            page: { type: "integer" },
                            limit: { type: "integer" },
                            totalPages: { type: "integer" },
                          },
                        },
                      },
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
    "/buses/validate": {
      post: {
        summary: "Validate bus data (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBusRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Bus data validation completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      $ref: "#/components/schemas/ValidateBusDataResponse",
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
    "/buses/tracking/multiple": {
      post: {
        summary: "Get live tracking for multiple buses",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["busIds"],
                properties: {
                  busIds: {
                    type: "array",
                    items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
                    minItems: 1,
                    maxItems: 50,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Multiple buses tracking data retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      $ref: "#/components/schemas/MultipleBusesTrackingResponse",
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
    "/buses/{busId}/status": {
      patch: {
        summary: "Update bus status (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateBusStatusRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Bus status updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/location": {
      patch: {
        summary: "Update bus location (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateLocationRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Bus location updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/tracking": {
      patch: {
        summary: "Update bus tracking data (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TrackingDataRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Bus tracking data updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/maintenance": {
      post: {
        summary: "Add maintenance record (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AddMaintenanceRecordRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Maintenance record added",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/assign-route": {
      post: {
        summary: "Assign route to bus (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignRouteRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Route assigned to bus",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus or route not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/unassign-route": {
      post: {
        summary: "Unassign route from bus (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UnassignRouteRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Route unassigned from bus",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/{busId}/assign-personnel": {
      post: {
        summary: "Assign personnel to bus (Admin or Operator only)",
        tags: ["Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignPersonnelRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Personnel assigned to bus",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Bus" },
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
          404: { description: "Bus not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/buses/admin/statistics": {
      get: {
        summary: "Get fleet statistics (Admin only)",
        tags: ["Admin Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "operator",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by operator ID",
          },
          {
            name: "route",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by route ID",
          },
          {
            name: "dateFrom",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Start date for statistics",
          },
          {
            name: "dateTo",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "End date for statistics",
          },
        ],
        responses: {
          200: {
            description: "Fleet statistics retrieved",
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
    "/buses/admin/summary": {
      get: {
        summary: "Get buses summary (Admin only)",
        tags: ["Admin Buses"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "active",
                "inactive",
                "maintenance",
                "out_of_service",
                "pending_approval",
              ],
              default: "active",
            },
            description: "Filter by bus status",
          },
          {
            name: "operator",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by operator ID",
          },
          {
            name: "route",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by route ID",
          },
        ],
        responses: {
          200: {
            description: "Buses summary retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/BusSummaryResponse" },
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
    "/buses/admin/bulk/status": {
      put: {
        summary: "Bulk update bus status (Admin only)",
        tags: ["Admin Buses"],
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
          200: {
            description: "Bus statuses updated",
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
    "/trips": {
      get: {
        summary: "Get all trips with filters",
        tags: ["Trips"],
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
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "scheduled",
                "boarding",
                "departed",
                "in_transit",
                "delayed",
                "arrived",
                "completed",
                "cancelled",
              ],
            },
            description: "Filter by trip status",
          },
          {
            name: "route",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by route ID",
          },
          {
            name: "bus",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by bus ID",
          },
          {
            name: "operator",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by operator ID",
          },
          {
            name: "dateFrom",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips starting from this date",
          },
          {
            name: "dateTo",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips ending by this date",
          },
          {
            name: "tripNumber",
            in: "query",
            schema: { type: "string", pattern: "^TRP-\\d{8}-\\d{3}$" },
            description: "Filter by trip number",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "schedule.scheduledDeparture",
                "tripNumber",
                "capacity.bookedSeats",
                "fare.baseFare",
              ],
              default: "schedule.scheduledDeparture",
            },
            description: "Sort field",
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
            description: "Sort order",
          },
        ],
        responses: {
          200: {
            description: "List of trips",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        trips: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Trip" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            totalTrips: { type: "integer" },
                            page: { type: "integer" },
                            limit: { type: "integer" },
                            totalPages: { type: "integer" },
                          },
                        },
                      },
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
        summary: "Create a new trip (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTripRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Trip created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
    "/trips/active": {
      get: {
        summary: "Get active trips",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Active trips retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
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
    "/trips/delayed": {
      get: {
        summary: "Get delayed trips (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "threshold",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 15 },
            description: "Delay threshold in minutes",
          },
        ],
        responses: {
          200: {
            description: "Delayed trips retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid threshold",
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
    "/trips/upcoming": {
      get: {
        summary: "Get upcoming trips",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "hours",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 168, default: 24 },
            description: "Time window in hours",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
            description: "Maximum number of trips",
          },
        ],
        responses: {
          200: {
            description: "Upcoming trips retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid parameters",
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
    "/trips/search/nearby": {
      get: {
        summary: "Find nearby trips",
        tags: ["Trips"],
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
            name: "radius",
            in: "query",
            schema: { type: "number", minimum: 1, maximum: 100, default: 50 },
            description: "Search radius in kilometers",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "scheduled",
                "boarding",
                "departed",
                "in_transit",
                "delayed",
                "arrived",
                "completed",
                "cancelled",
              ],
            },
            description: "Filter by trip status",
          },
        ],
        responses: {
          200: {
            description: "Nearby trips retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid coordinates or parameters",
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
    "/trips/operator/{operatorId}": {
      get: {
        summary: "Get trips by operator (Admin or Operator only)",
        tags: ["Trips"],
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
              enum: [
                "scheduled",
                "boarding",
                "departed",
                "in_transit",
                "delayed",
                "arrived",
                "completed",
                "cancelled",
              ],
            },
            description: "Filter by trip status",
          },
          {
            name: "dateFrom",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips starting from this date",
          },
          {
            name: "dateTo",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips ending by this date",
          },
        ],
        responses: {
          200: {
            description: "Trips by operator retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid operator ID or parameters",
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
    "/trips/route/{routeId}": {
      get: {
        summary: "Get trips by route",
        tags: ["Trips"],
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
            name: "dateFrom",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips starting from this date",
          },
          {
            name: "dateTo",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips ending by this date",
          },
        ],
        responses: {
          200: {
            description: "Trips by route retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    lurking: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid route ID or parameters",
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
    "/trips/bus/{busId}": {
      get: {
        summary: "Get trips by bus (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "busId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Bus ID",
          },
          {
            name: "dateFrom",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips starting from this date",
          },
          {
            name: "dateTo",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips ending by this date",
          },
        ],
        responses: {
          200: {
            description: "Trips by bus retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid bus ID or parameters",
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
    "/trips/my-trips": {
      get: {
        summary: "Get operator's own trips (Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "scheduled",
                "boarding",
                "departed",
                "in_transit",
                "delayed",
                "arrived",
                "completed",
                "cancelled",
              ],
            },
            description: "Filter by trip status",
          },
          {
            name: "dateFrom",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips starting from this date",
          },
          {
            name: "dateTo",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips ending by this date",
          },
        ],
        responses: {
          200: {
            description: "Operator's trips retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
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
    "/trips/number/{tripNumber}": {
      get: {
        summary: "Get trip by trip number",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripNumber",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^TRP-\\d{8}-\\d{3}$" },
            description: "Trip number",
          },
        ],
        responses: {
          200: {
            description: "Trip retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid trip number",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/incidents": {
      get: {
        summary: "Get trips with incidents (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "severity",
            in: "query",
            schema: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
            },
            description: "Filter by incident severity",
          },
          {
            name: "resolved",
            in: "query",
            schema: { type: "boolean" },
            description: "Filter by incident resolution status",
          },
        ],
        responses: {
          200: {
            description: "Trips with incidents retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
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
    "/trips/{tripId}": {
      get: {
        summary: "Get trip by ID",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        responses: {
          200: {
            description: "Trip retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid trip ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      put: {
        summary: "Update trip (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTripRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Trip updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
      delete: {
        summary: "Delete trip (Admin only)",
        tags: ["Admin Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0- комодка-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        responses: {
          200: {
            description: "Trip deleted",
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
            description: "Invalid trip ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/search/advanced": {
      post: {
        summary: "Advanced trip search",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TripSearchRequest" },
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
                      type: "object",
                      properties: {
                        trips: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Trip" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            totalTrips: { type: "integer" },
                            page: { type: "integer" },
                            limit: { type: "integer" },
                            totalPages: { type: "integer" },
                          },
                        },
                      },
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
    "/trips/generate-schedule": {
      post: {
        summary: "Generate recurring trips (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GenerateScheduleRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Recurring trips generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Trip" },
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
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/status": {
      patch: {
        summary: "Update trip status (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateStatusRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Trip status updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/location": {
      patch: {
        summary: "Update trip location (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateLocationRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Trip location updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/tracking": {
      patch: {
        summary: "Update live tracking data (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LiveTrackingRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Live tracking data updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/incidents": {
      post: {
        summary: "Add incident to trip (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/IncidentRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Incident added",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/waypoints": {
      patch: {
        summary: "Update waypoint status (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateWaypointRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Waypoint updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip or waypoint not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/passengers": {
      post: {
        summary: "Add passenger activity (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PassengerActivityRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Passenger activity added",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip or waypoint not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/ratings": {
      post: {
        summary: "Add rating to trip (Commuter only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddRatingRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Rating added",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/revenue": {
      patch: {
        summary: "Update trip revenue (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRevenueRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Trip revenue updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Trip" },
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
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/cancel": {
      post: {
        summary: "Cancel trip (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reason"],
                properties: {
                  reason: { type: "string", maxLength: 500 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Trip cancelled",
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
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/{tripId}/complete": {
      post: {
        summary: "Complete trip (Admin or Operator only)",
        tags: ["Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "tripId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Trip ID",
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  actualArrival: { type: "string", format: "date-time" },
                  revenue: {
                    $ref: "#/components/schemas/UpdateRevenueRequest",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Trip completed",
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
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Trip not found" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/admin/bulk-update": {
      patch: {
        summary: "Bulk update trip statuses (Admin only)",
        tags: ["Admin Trips"],
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
          200: {
            description: "Trip statuses updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        updatedCount: { type: "integer" },
                        updatedTrips: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Trip" },
                        },
                      },
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
          403: { description: "Forbidden" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
    "/trips/admin/analytics": {
      get: {
        summary: "Get trip analytics (Admin only)",
        tags: ["Admin Trips"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "operator",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by operator ID",
          },
          {
            name: "route",
            in: "query",
            schema: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
            description: "Filter by route ID",
          },
          {
            name: "dateFrom",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips starting from this date",
          },
          {
            name: "dateTo",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "Filter trips ending by this date",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "scheduled",
                "boarding",
                "departed",
                "in_transit",
                "delayed",
                "arrived",
                "completed",
                "cancelled",
              ],
            },
            description: "Filter by trip status",
          },
        ],
        responses: {
          200: {
            description: "Trip analytics retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        totalTrips: { type: "integer" },
                        averageRevenue: { type: "number" },
                        averageOccupancy: { type: "number" },
                        delayStatistics: {
                          type: "object",
                          properties: {
                            delayedTrips: { type: "integer" },
                            averageDelay: { type: "number" },
                          },
                        },
                        statusBreakdown: {
                          type: "object",
                          additionalProperties: { type: "integer" },
                        },
                      },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid parameters",
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
    "/tracking/nearby": {
      get: {
        summary: "Find buses near a location",
        description:
          "Retrieves buses within a specified radius of a given location (for commuters)",
        tags: ["Public/Commuter"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "latitude",
            schema: { type: "number", minimum: 5.9, maximum: 9.9 },
            required: true,
            description: "Latitude within Sri Lanka bounds",
          },
          {
            in: "query",
            name: "longitude",
            schema: { type: "number", minimum: 79.6, maximum: 81.9 },
            required: true,
            description: "Longitude within Sri Lanka bounds",
          },
          {
            in: "query",
            name: "radius",
            schema: { type: "number", minimum: 1, maximum: 200, default: 50 },
            description: "Radius in kilometers",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        buses: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tracking" },
                        },
                        count: { type: "number" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid latitude or longitude",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/trip/{tripId}": {
      get: {
        summary: "Get tracking data for a specific trip",
        description: "Retrieves tracking data associated with a specific trip",
        tags: ["Public/Commuter"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "tripId",
            schema: { type: "string", format: "objectId" },
            required: true,
            description: "ID of the trip",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Tracking" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Trip not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/status": {
      get: {
        summary: "Get current tracking status",
        description: "Retrieves the current status of a tracking session",
        tags: ["Public/Commuter"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        status: {
                          type: "string",
                          enum: [
                            "active",
                            "paused",
                            "stopped",
                            "completed",
                            "emergency",
                            "offline",
                          ],
                        },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/history": {
      get: {
        summary: "Get location history for a tracking session",
        description: "Retrieves the location history for a tracking session",
        tags: ["Public/Commuter"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
          {
            in: "query",
            name: "hours",
            schema: { type: "number", default: 24 },
            description: "Number of hours to retrieve history for",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          location: {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["Point"] },
                              coordinates: {
                                type: "array",
                                items: { type: "number" },
                                minItems: 2,
                                maxItems: 2,
                              },
                            },
                          },
                          speed: { type: "number" },
                          heading: { type: "number" },
                          altitude: { type: "number" },
                          accuracy: { type: "number" },
                          timestamp: { type: "string", format: "date-time" },
                          address: { type: "string" },
                          distanceFromPrevious: { type: "number" },
                          timeSinceLastUpdate: { type: "number" },
                        },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/start": {
      post: {
        summary: "Start a new tracking session",
        description: "Creates a new tracking session for a bus operator",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StartTrackingRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { $ref: "#/schemas/Tracking" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not a bus operator or admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/location": {
      put: {
        summary: "Update current location",
        description: "Updates the current location of a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateLocationRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        currentLocation: {
                          type: "object",
                          properties: {
                            type: { type: "string", enum: ["Point"] },
                            coordinates: {
                              type: "array",
                              items: { type: "number" },
                              minItems: 2,
                              maxItems: 2,
                            },
                          },
                        },
                        speed: { type: "number" },
                        timestamp: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/heartbeat": {
      put: {
        summary: "Update heartbeat",
        description: "Updates the keep-alive signal for a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HeartbeatRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        timestamp: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/stop": {
      post: {
        summary: "Stop tracking session",
        description: "Stops a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PauseResumeRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/pause": {
      put: {
        summary: "Pause tracking session",
        description: "Pauses a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PauseResumeRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        status: { type: "string", enum: ["paused"] },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/resume": {
      put: {
        summary: "Resume tracking session",
        description: "Resumes a paused tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        status: { type: "string", enum: ["active"] },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/emergency": {
      post: {
        summary: "Trigger emergency alert",
        description: "Triggers an emergency alert for a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EmergencyRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Emergency triggered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        emergencyStatus: { type: "boolean" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/emergency/resolve": {
      put: {
        summary: "Resolve emergency",
        description: "Resolves an active emergency for a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EmergencyResolutionRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        emergencyStatus: { type: "boolean" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/alerts": {
      post: {
        summary: "Add a tracking alert",
        description: "Adds a new alert to a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AlertRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Alert added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        alertsCount: { type: "number" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/alerts/{alertId}/acknowledge": {
      put: {
        summary: "Acknowledge an alert",
        description: "Acknowledges an alert in a tracking session",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
          {
            in: "path",
            name: "alertId",
            schema: { type: "string" },
            required: true,
            description: "Alert ID",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        alertId: { type: "string" },
                        acknowledgedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Alert or tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/my-sessions": {
      get: {
        summary: "Get operator's own tracking sessions",
        description:
          "Retrieves tracking sessions for the authenticated bus operator",
        tags: ["Bus Operator"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "number", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "number", minimum: 1, maximum: 100, default: 10 },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: [
                "active",
                "paused",
                "stopped",
                "completed",
                "emergency",
                "offline",
              ],
            },
          },
          {
            in: "query",
            name: "busId",
            schema: { type: "string", format: "objectId" },
          },
          {
            in: "query",
            name: "routeId",
            schema: { type: "string", format: "objectId" },
          },
          {
            in: "query",
            name: "tripId",
            schema: { type: "string", format: "objectId" },
          },
          { in: "query", name: "driverId", schema: { type: "string" } },
          {
            in: "query",
            name: "dateFrom",
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "dateTo",
            schema: { type: "string", format: "date-time" },
          },
          { in: "query", name: "isOnline", schema: { type: "boolean" } },
          { in: "query", name: "inEmergency", schema: { type: "boolean" } },
          {
            in: "query",
            name: "nearLatitude",
            schema: { type: "number", minimum: 5.9, maximum: 9.9 },
          },
          {
            in: "query",
            name: "nearLongitude",
            schema: { type: "number", minimum: 79.6, maximum: 81.9 },
          },
          {
            in: "query",
            name: "radiusKm",
            schema: { type: "number", minimum: 1, maximum: 200, default: 50 },
          },
          { in: "query", name: "search", schema: { type: "string" } },
          {
            in: "query",
            name: "sortBy",
            schema: {
              type: "string",
              enum: [
                "realTimeData.timestamp",
                "metadata.startTime",
                "performance.averageSpeed",
                "performance.totalDistance",
                "trackingId",
              ],
              default: "realTimeData.timestamp",
            },
          },
          {
            in: "query",
            name: "sortOrder",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingSessions: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tracking" },
                        },
                        count: { type: "number" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not a bus operator)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking": {
      get: {
        summary: "Get all tracking sessions with filters",
        description: "Retrieves all tracking sessions with optional filters",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "number", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "number", minimum: 1, maximum: 100, default: 10 },
          },
          {
            in: "query",
            name: "status",
            schema: {
              type: "string",
              enum: [
                "active",
                "paused",
                "stopped",
                "completed",
                "emergency",
                "offline",
              ],
            },
          },
          {
            in: "query",
            name: "busId",
            schema: { type: "string", format: "objectId" },
          },
          {
            in: "query",
            name: "routeId",
            schema: { type: "string", format: "objectId" },
          },
          {
            in: "query",
            name: "tripId",
            schema: { type: "string", format: "objectId" },
          },
          { in: "query", name: "driverId", schema: { type: "string" } },
          {
            in: "query",
            name: "dateFrom",
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "dateTo",
            schema: { type: "string", format: "date-time" },
          },
          { in: "query", name: "isOnline", schema: { type: "boolean" } },
          { in: "query", name: "inEmergency", schema: { type: "boolean" } },
          {
            in: "query",
            name: "nearLatitude",
            schema: { type: "number", minimum: 5.9, maximum: 9.9 },
          },
          {
            in: "query",
            name: "nearLongitude",
            schema: { type: "number", minimum: 79.6, maximum: 81.9 },
          },
          {
            in: "query",
            name: "radiusKm",
            schema: { type: "number", minimum: 1, maximum: 200, default: 50 },
          },
          { in: "query", name: "search", schema: { type: "string" } },
          {
            in: "query",
            name: "sortBy",
            schema: {
              type: "string",
              enum: [
                "realTimeData.timestamp",
                "metadata.startTime",
                "performance.averageSpeed",
                "performance.totalDistance",
                "trackingId",
              ],
              default: "realTimeData.timestamp",
            },
          },
          {
            in: "query",
            name: "sortOrder",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingSessions: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tracking" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            page: { type: "number" },
                            limit: { type: "number" },
                            total: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/active": {
      get: {
        summary: "Get active tracking sessions",
        description: "Retrieves all active tracking sessions",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "number", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "number", minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingSessions: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tracking" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            page: { type: "number" },
                            limit: { type: "number" },
                            total: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/dashboard": {
      get: {
        summary: "Get real-time dashboard data",
        description: "Retrieves real-time dashboard data for tracking sessions",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/offline": {
      get: {
        summary: "Get offline buses",
        description: "Retrieves buses that are currently offline",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "minutes",
            schema: { type: "number", default: 10 },
            description: "Number of minutes to consider a bus offline",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        offlineBuses: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tracking" },
                        },
                        count: { type: "number" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/analytics": {
      get: {
        summary: "Get tracking analytics",
        description: "Retrieves analytics data for tracking sessions",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "dateFrom",
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "dateTo",
            schema: { type: "string", format: "date-time" },
          },
          {
            in: "query",
            name: "groupBy",
            schema: {
              type: "string",
              enum: ["hour", "day", "week", "month", "status", "route"],
              default: "day",
            },
          },
          {
            in: "query",
            name: "operatorId",
            schema: { type: "string", format: "objectId" },
          },
          {
            in: "query",
            name: "routeId",
            schema: { type: "string", format: "objectId" },
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}": {
      get: {
        summary: "Get tracking session by ID",
        description: "Retrieves a specific tracking session by its ID",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Tracking" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/metrics": {
      get: {
        summary: "Get performance metrics",
        description: "Retrieves performance metrics for a tracking session",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        averageSpeed: { type: "number" },
                        maxSpeed: { type: "number" },
                        totalDistance: { type: "number" },
                        totalDrivingTime: { type: "number" },
                        fuelEfficiency: { type: "number" },
                        stopTime: { type: "number" },
                        routeDeviations: { type: "number" },
                        speedViolations: { type: "number" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/{trackingId}/settings": {
      put: {
        summary: "Update tracking settings",
        description: "Updates the settings for a tracking session",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "trackingId",
            schema: { type: "string", pattern: "^TRK-\\d{8}-\\d{6}$" },
            required: true,
            description: "Tracking ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateSettingsRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingId: { type: "string" },
                        settings: {
                          type: "object",
                          properties: {
                            updateInterval: { type: "number" },
                            trackingAccuracy: { type: "string" },
                            alertsEnabled: { type: "boolean" },
                            shareLocation: { type: "boolean" },
                          },
                        },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Tracking session not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/operator/{operatorId}": {
      get: {
        summary: "Get tracking sessions by operator",
        description: "Retrieves tracking sessions for a specific operator",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "operatorId",
            schema: { type: "string", format: "objectId" },
            required: true,
            description: "Operator ID",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "number", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "number", minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        trackingSessions: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tracking" },
                        },
                        count: { type: "number" },
                      },
                    },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Operator not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/cleanup": {
      post: {
        summary: "Clean up old tracking data",
        description:
          "Cleans up tracking data older than the specified number of days",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CleanupRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/tracking/process-offline": {
      post: {
        summary: "Process offline buses",
        description: "Processes buses that are currently offline",
        tags: ["NTC Admin"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", default: true },
                    message: { type: "string" },
                    data: { type: "object" },
                  },
                  required: ["success", "message", "data"],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (not an admin)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
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
    { name: "Buses", description: "Bus management endpoints" },
    { name: "Admin Buses", description: "Admin bus management endpoints" },
    {
      name: "Trips",
      description:
        "Endpoints for managing and querying trip information, accessible to authenticated users, operators, or admins depending on the endpoint.",
    },
    {
      name: "Admin Trips",
      description:
        "Endpoints for administrative trip operations, restricted to admin users only.",
    },
    {
      name: "Public/Commuter",
      description:
        "Endpoints accessible to authenticated users (commuters) for tracking buses",
    },
    {
      name: "Bus Operator",
      description:
        "Endpoints for bus operators to manage tracking sessions and alerts",
    },
    {
      name: "NTC Admin",
      description:
        "Administrative endpoints for managing and monitoring tracking sessions",
    },
  ],
};

module.exports = openapiSpecification;
