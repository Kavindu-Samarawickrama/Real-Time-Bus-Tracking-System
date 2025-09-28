// src/services/busService.js
const busRepository = require("../repositories/busRepository");
const userRepository = require("../repositories/userRepository");
const routeRepository = require("../repositories/routeRepository");
const { ApiError } = require("../utils/errors");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

class BusService {
  /**
   * Create a new bus
   */
  async createBus(busData, createdBy) {
    try {
      // Check if registration number already exists
      const existingRegistration = await busRepository.registrationNumberExists(
        busData.registrationNumber
      );
      if (existingRegistration) {
        throw new ApiError("Bus registration number already exists", 409);
      }

      // Check if permit number already exists
      const existingPermit = await busRepository.permitNumberExists(
        busData.permitNumber
      );
      if (existingPermit) {
        throw new ApiError("Permit number already exists", 409);
      }

      // Validate that operator exists and is a bus operator
      const operator = await userRepository.findById(
        busData.operationalDetails.operator
      );
      if (
        !operator ||
        operator.role !== "bus_operator" ||
        operator.status !== "active"
      ) {
        throw new ApiError("Operator must be an active bus operator", 400);
      }

      // Validate assigned route if provided
      if (busData.operationalDetails.assignedRoute) {
        const route = await routeRepository.findById(
          busData.operationalDetails.assignedRoute,
          false
        );
        if (!route || route.status !== "active") {
          throw new ApiError("Assigned route must be active", 400);
        }

        // Check if operator is authorized for this route
        const isAuthorized = route.operatedBy.some(
          (op) => op.toString() === busData.operationalDetails.operator
        );
        if (!isAuthorized) {
          throw new ApiError(
            "Operator is not authorized for the assigned route",
            403
          );
        }
      }

      // Add creator to bus data
      const enrichedBusData = {
        ...busData,
        createdBy,
        status: "pending_approval",
      };

      const bus = await busRepository.create(enrichedBusData);

      logger.info(
        `New bus created: ${bus.registrationNumber} by user ${createdBy}`
      );

      // Send notification to NTC admins about new bus registration
      try {
        await notificationService.createNotification(
          {
            type: "system_announcement",
            priority: "normal",
            title: "New Bus Registration",
            message: `A new bus (${
              bus.registrationNumber
            }) has been registered by ${
              operator.organizationDetails?.companyName || "operator"
            } and is pending approval.`,
            recipients: {
              groups: ["ntc_admins"],
            },
            relatedData: {
              bus: bus._id,
              operator: bus.operationalDetails.operator,
            },
            metadata: {
              source: "automated",
              category: "bus_management",
            },
          },
          createdBy
        );
      } catch (notificationError) {
        logger.warn(
          "Failed to send bus registration notification:",
          notificationError
        );
      }

      return bus;
    } catch (error) {
      logger.error("Bus creation failed:", error);
      throw error;
    }
  }

  /**
   * Get bus by ID
   */
  async getBusById(busId) {
    try {
      const bus = await busRepository.findById(busId);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      return bus;
    } catch (error) {
      logger.error("Get bus by ID failed:", error);
      throw error;
    }
  }

  /**
   * Get bus by registration number
   */
  async getBusByRegistrationNumber(registrationNumber) {
    try {
      const bus = await busRepository.findByRegistrationNumber(
        registrationNumber
      );

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      return bus;
    } catch (error) {
      logger.error("Get bus by registration number failed:", error);
      throw error;
    }
  }

  /**
   * Update bus
   */
  async updateBus(busId, updateData, updatedBy) {
    try {
      const existingBus = await busRepository.findById(busId, false);

      if (!existingBus) {
        throw new ApiError("Bus not found", 404);
      }

      // Validate operator if provided
      if (updateData.operationalDetails?.operator) {
        const operator = await userRepository.findById(
          updateData.operationalDetails.operator
        );
        if (
          !operator ||
          operator.role !== "bus_operator" ||
          operator.status !== "active"
        ) {
          throw new ApiError("Operator must be an active bus operator", 400);
        }
      }

      // Validate assigned route if provided
      if (updateData.operationalDetails?.assignedRoute) {
        const route = await routeRepository.findById(
          updateData.operationalDetails.assignedRoute,
          false
        );
        if (!route || route.status !== "active") {
          throw new ApiError("Assigned route must be active", 400);
        }
      }

      // Add updater info
      const enrichedUpdateData = {
        ...updateData,
        lastModifiedBy: updatedBy,
      };

      const updatedBus = await busRepository.updateById(
        busId,
        enrichedUpdateData
      );

      logger.info(
        `Bus updated: ${updatedBus.registrationNumber} by user ${updatedBy}`
      );

      return updatedBus;
    } catch (error) {
      logger.error("Update bus failed:", error);
      throw error;
    }
  }

  /**
   * Update bus status
   */
  async updateBusStatus(busId, status, reason, updatedBy) {
    try {
      const bus = await busRepository.findById(busId, false);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      const updateData = {
        status,
        lastModifiedBy: updatedBy,
      };

      // Set approval info if approving
      if (status === "active" && bus.status === "pending_approval") {
        updateData.approvedBy = updatedBy;
        updateData.approvedAt = new Date();
      }

      const updatedBus = await busRepository.updateById(busId, updateData);

      // Send notifications based on status change
      try {
        if (status === "active" && bus.status === "pending_approval") {
          // Notify operator about approval
          await notificationService.createNotification(
            {
              type: "system_announcement",
              priority: "normal",
              title: "Bus Registration Approved",
              message: `Your bus ${bus.registrationNumber} has been approved and is now active in the system.`,
              recipients: {
                users: [
                  {
                    user: bus.operationalDetails.operator,
                    email: operator?.email || "operator@example.com",
                    name: operator?.profile?.firstName
                      ? `${operator.profile.firstName} ${
                          operator.profile.lastName || ""
                        }`
                      : "Operator",
                    role: "bus_operator",
                  },
                ],
              },
              relatedData: {
                bus: bus._id,
              },
            },
            updatedBy
          );
        } else if (status === "suspended") {
          // Notify operator about suspension
          await notificationService.createNotification(
            {
              type: "maintenance_notice",
              priority: "high",
              title: "Bus Suspended",
              message: `Your bus ${
                bus.registrationNumber
              } has been suspended. ${
                reason ? `Reason: ${reason}` : "Please contact NTC for details."
              }`,
              recipients: {
                users: [
                  {
                    user: bus.operationalDetails.operator,
                    email: operator?.email || "operator@example.com",
                    name: operator?.profile?.firstName
                      ? `${operator.profile.firstName} ${
                          operator.profile.lastName || ""
                        }`
                      : "Operator",
                    role: "bus_operator",
                  },
                ],
              },
              relatedData: {
                bus: bus._id,
              },
            },
            updatedBy
          );
        }
      } catch (notificationError) {
        logger.warn(
          "Failed to send bus status notification:",
          notificationError
        );
      }

      logger.info(
        `Bus status updated: ${
          bus.registrationNumber
        } → ${status} by user ${updatedBy}${
          reason ? ` (Reason: ${reason})` : ""
        }`
      );

      return updatedBus;
    } catch (error) {
      logger.error("Update bus status failed:", error);
      throw error;
    }
  }

  /**
   * Delete bus
   */
  async deleteBus(busId, deletedBy) {
    try {
      const bus = await busRepository.findById(busId, false);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      // Check if bus has active trips (this would be implemented when trip management is added)
      if (bus.status === "active") {
        throw new ApiError(
          "Cannot delete an active bus. Please deactivate it first.",
          400
        );
      }

      await busRepository.deleteById(busId);

      logger.info(
        `Bus deleted: ${bus.registrationNumber} by user ${deletedBy}`
      );

      return { message: "Bus deleted successfully" };
    } catch (error) {
      logger.error("Delete bus failed:", error);
      throw error;
    }
  }

  /**
   * Get buses with filters
   */
  async getBuses(options) {
    try {
      const result = await busRepository.findWithFilters({}, options);
      return result;
    } catch (error) {
      logger.error("Get buses list failed:", error);
      throw error;
    }
  }

  /**
   * Get buses by operator
   */
  async getBusesByOperator(operatorId, status = null) {
    try {
      // Verify operator exists and is a bus operator
      const operator = await userRepository.findById(operatorId);
      if (!operator) {
        throw new ApiError("Operator not found", 404);
      }
      if (operator.role !== "bus_operator") {
        throw new ApiError("User is not a bus operator", 400);
      }

      const buses = await busRepository.findByOperator(operatorId, status);
      return buses;
    } catch (error) {
      logger.error("Get buses by operator failed:", error);
      throw error;
    }
  }

  /**
   * Get buses by route
   */
  async getBusesByRoute(routeId, status = "active") {
    try {
      // Verify route exists
      const route = await routeRepository.findById(routeId, false);
      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      const buses = await busRepository.findByRoute(routeId, status);
      return buses;
    } catch (error) {
      logger.error("Get buses by route failed:", error);
      throw error;
    }
  }

  /**
   * Advanced bus search
   */
  async advancedSearch(searchParams) {
    try {
      const result = await busRepository.advancedSearch(searchParams);
      return result;
    } catch (error) {
      logger.error("Advanced bus search failed:", error);
      throw error;
    }
  }

  /**
   * Get fleet statistics
   */
  async getFleetStatistics(operatorId = null) {
    try {
      // If operatorId provided, verify it's valid
      if (operatorId) {
        const operator = await userRepository.findById(operatorId);
        if (!operator || operator.role !== "bus_operator") {
          throw new ApiError("Invalid operator ID", 400);
        }
      }

      const stats = await busRepository.getFleetStats(operatorId);
      const recentBuses = await busRepository.getRecentBuses(7, 5);
      const needingService = await busRepository.findNeedingService();
      const expiringPermits = await busRepository.findWithExpiringPermits(30);

      return {
        ...stats,
        recentBuses,
        maintenanceAlerts: {
          needingService: needingService.length,
          expiringPermits: expiringPermits.length,
          buses: needingService.slice(0, 10), // Return first 10
        },
        totalBuses: stats.fleetStats.reduce((acc, stat) => acc + stat.total, 0),
      };
    } catch (error) {
      logger.error("Get fleet statistics failed:", error);
      throw error;
    }
  }

  /**
   * Bulk update bus status
   */
  async bulkUpdateStatus(busIds, status, reason, updatedBy) {
    try {
      // Verify all buses exist
      const buses = await Promise.all(
        busIds.map((id) => busRepository.findById(id, false))
      );

      const notFoundBuses = buses.filter((bus) => !bus);
      if (notFoundBuses.length > 0) {
        throw new ApiError("One or more buses not found", 404);
      }

      const updateData = {
        status,
        lastModifiedBy: updatedBy,
      };

      // Set approval info if approving
      if (status === "active") {
        updateData.approvedBy = updatedBy;
        updateData.approvedAt = new Date();
      }

      const result = await busRepository.bulkUpdate(
        { _id: { $in: busIds } },
        updateData
      );

      logger.info(
        `Bulk status update: ${
          result.modifiedCount
        } buses updated to ${status} by ${updatedBy}${
          reason ? ` (Reason: ${reason})` : ""
        }`
      );

      return {
        message: `${result.modifiedCount} buses updated successfully`,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      logger.error("Bulk update bus status failed:", error);
      throw error;
    }
  }

  /**
   * Update bus location
   */
  async updateBusLocation(busId, locationData) {
    try {
      const bus = await busRepository.findById(busId, false);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      const updatedBus = await busRepository.updateLocation(
        busId,
        locationData
      );

      return updatedBus;
    } catch (error) {
      logger.error("Update bus location failed:", error);
      throw error;
    }
  }

  /**
   * Add maintenance record
   */
  async addMaintenanceRecord(busId, recordData, addedBy) {
    try {
      const bus = await busRepository.findById(busId, false);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      const enrichedRecord = {
        ...recordData,
        performedBy: recordData.performedBy || "System",
      };

      const updatedBus = await busRepository.addMaintenanceRecord(
        busId,
        enrichedRecord
      );

      logger.info(
        `Maintenance record added for bus ${bus.registrationNumber}: ${recordData.type} - ${recordData.description}`
      );

      return updatedBus;
    } catch (error) {
      logger.error("Add maintenance record failed:", error);
      throw error;
    }
  }

  /**
   * Assign route to bus
   */
  async assignRoute(busId, routeId, assignedBy) {
    try {
      const [bus, route] = await Promise.all([
        busRepository.findById(busId, false),
        routeRepository.findById(routeId, false),
      ]);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      if (!route) {
        throw new ApiError("Route not found", 404);
      }

      if (route.status !== "active") {
        throw new ApiError("Cannot assign inactive route", 400);
      }

      // Check if operator is authorized for this route
      const isAuthorized = route.operatedBy.some(
        (op) => op.toString() === bus.operationalDetails.operator.toString()
      );
      if (!isAuthorized) {
        throw new ApiError(
          "Bus operator is not authorized for this route",
          403
        );
      }

      const updatedBus = await busRepository.assignRoute(busId, routeId);

      logger.info(
        `Bus ${bus.registrationNumber} assigned to route ${route.routeNumber} by ${assignedBy}`
      );

      return updatedBus;
    } catch (error) {
      logger.error("Assign route to bus failed:", error);
      throw error;
    }
  }

  /**
   * Unassign route from bus
   */
  async unassignRoute(busId, reason, unassignedBy) {
    try {
      const bus = await busRepository.findById(busId, false);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      if (!bus.operationalDetails.assignedRoute) {
        throw new ApiError("Bus is not assigned to any route", 400);
      }

      const updatedBus = await busRepository.unassignRoute(busId);

      logger.info(
        `Bus ${
          bus.registrationNumber
        } unassigned from route by ${unassignedBy}${
          reason ? ` (Reason: ${reason})` : ""
        }`
      );

      return updatedBus;
    } catch (error) {
      logger.error("Unassign route from bus failed:", error);
      throw error;
    }
  }

  /**
   * Find buses by location
   */
  async findBusesByLocation(coordinates, radiusKm = 50) {
    try {
      const buses = await busRepository.findByLocation(coordinates, radiusKm);
      return buses;
    } catch (error) {
      logger.error("Find buses by location failed:", error);
      throw error;
    }
  }

  /**
   * Get buses needing service
   */
  async getBusesNeedingService() {
    try {
      const buses = await busRepository.findNeedingService();
      return buses;
    } catch (error) {
      logger.error("Get buses needing service failed:", error);
      throw error;
    }
  }

  /**
   * Get buses with expiring permits
   */
  async getBusesWithExpiringPermits(days = 30) {
    try {
      const buses = await busRepository.findWithExpiringPermits(days);
      return buses;
    } catch (error) {
      logger.error("Get buses with expiring permits failed:", error);
      throw error;
    }
  }

  /**
   * Validate user permissions for bus operations
   */
  async validateBusPermissions(userId, busId, operation) {
    try {
      const user = await userRepository.findById(userId);
      const bus = await busRepository.findById(busId, false);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      // NTC admins can perform any operation
      if (user.role === "ntc_admin") {
        return true;
      }

      // Bus operators can only manage their own buses
      if (user.role === "bus_operator") {
        const isOwner = bus.operationalDetails.operator.toString() === userId;

        if (!isOwner) {
          throw new ApiError("You can only manage buses you operate", 403);
        }

        // Operators cannot delete buses or approve them
        if (["delete", "approve"].includes(operation)) {
          throw new ApiError(
            "Insufficient permissions for this operation",
            403
          );
        }

        return true;
      }

      // Commuters cannot manage buses
      throw new ApiError("Insufficient permissions to manage buses", 403);
    } catch (error) {
      logger.error("Validate bus permissions failed:", error);
      throw error;
    }
  }

  /**
   * Get my buses (for bus operators)
   */
  async getMyBuses(userId, options = {}) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      if (user.role !== "bus_operator") {
        throw new ApiError("Only bus operators can access this endpoint", 403);
      }

      const buses = await busRepository.findByOperator(userId, options.status);
      return buses;
    } catch (error) {
      logger.error("Get my buses failed:", error);
      throw error;
    }
  }

  /**
   * Get bus maintenance history
   */
  async getBusMaintenanceHistory(busId) {
    try {
      const bus = await busRepository.findById(busId, false);

      if (!bus) {
        throw new ApiError("Bus not found", 404);
      }

      return {
        busInfo: {
          registrationNumber: bus.registrationNumber,
          make: bus.vehicleDetails.make,
          model: bus.vehicleDetails.model,
          year: bus.vehicleDetails.year,
        },
        maintenanceRecords: bus.maintenance.maintenanceRecords || [],
        nextServiceDue: bus.maintenance.nextServiceDue,
        serviceDueStatus: bus.serviceDueStatus,
        currentMileage: bus.maintenance.currentMileage,
      };
    } catch (error) {
      logger.error("Get bus maintenance history failed:", error);
      throw error;
    }
  }
}

module.exports = new BusService();
