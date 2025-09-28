// src/services/notificationService.js
const notificationRepository = require("../repositories/notificationRepository");
const userRepository = require("../repositories/userRepository");
const emailService = require("../utils/emailService");
const { ApiError } = require("../utils/errors");
const logger = require("../utils/logger");

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(notificationData, createdBy) {
    try {
      // Resolve recipients if groups are specified
      if (
        notificationData.recipients.groups &&
        notificationData.recipients.groups.length > 0
      ) {
        const resolvedUsers = await this.resolveRecipientGroups(
          notificationData.recipients.groups
        );
        notificationData.recipients.users = [
          ...(notificationData.recipients.users || []),
          ...resolvedUsers,
        ];
      }

      // Remove duplicates
      if (notificationData.recipients.users) {
        const userMap = new Map();
        notificationData.recipients.users.forEach((user) => {
          userMap.set(user.user.toString(), user);
        });
        notificationData.recipients.users = Array.from(userMap.values());
      }

      // Validate recipients exist
      if (
        !notificationData.recipients.users ||
        notificationData.recipients.users.length === 0
      ) {
        throw new ApiError("At least one recipient is required", 400);
      }

      // Add creator to notification data
      const enrichedNotificationData = {
        ...notificationData,
        createdBy,
        delivery: {
          status: "draft",
          channel: "email",
          ...notificationData.delivery,
        },
      };

      const notification = await notificationRepository.create(
        enrichedNotificationData
      );

      logger.info(
        `New notification created: ${notification.notificationId} by user ${createdBy}`
      );

      // Auto-send if not scheduled
      if (
        !notification.delivery.scheduledFor &&
        notification.delivery.status === "draft"
      ) {
        await this.sendNotification(notification._id);
      }

      return notification;
    } catch (error) {
      logger.error("Notification creation failed:", error);
      throw error;
    }
  }

  /**
   * Send notification immediately or queue for later
   */
  async sendNotification(notificationId) {
    try {
      const notification = await notificationRepository.findById(
        notificationId
      );

      if (!notification) {
        throw new ApiError("Notification not found", 404);
      }

      if (
        notification.delivery.status !== "draft" &&
        notification.delivery.status !== "queued"
      ) {
        throw new ApiError(
          "Notification has already been sent or is in process",
          400
        );
      }

      // Check if expired
      if (notification.isExpired()) {
        throw new ApiError("Cannot send expired notification", 400);
      }

      // Check if scheduled for later
      if (
        notification.delivery.scheduledFor &&
        new Date(notification.delivery.scheduledFor) > new Date()
      ) {
        await notificationRepository.updateById(notificationId, {
          "delivery.status": "queued",
        });
        logger.info(
          `Notification queued for later: ${notification.notificationId}`
        );
        return { message: "Notification queued successfully" };
      }

      // Update status to sending
      await notificationRepository.updateById(notificationId, {
        "delivery.status": "sending",
        "delivery.sentAt": new Date(),
      });

      // Send emails to all recipients
      let deliveredCount = 0;
      let failedCount = 0;
      const failedRecipients = [];

      for (const recipient of notification.recipients.users) {
        try {
          const result = await emailService.sendNotificationEmail(
            notification,
            recipient
          );

          if (result.success) {
            // Mark as delivered
            await notificationRepository.markDelivered(
              notification._id,
              recipient.user
            );
            deliveredCount++;
            logger.info(
              `Email sent to ${recipient.email} for notification ${notification.notificationId}`
            );
          } else {
            failedCount++;
            failedRecipients.push({
              email: recipient.email,
              error: result.error,
            });
            logger.error(
              `Failed to send email to ${recipient.email}: ${result.error}`
            );
          }
        } catch (emailError) {
          failedCount++;
          failedRecipients.push({
            email: recipient.email,
            error: emailError.message,
          });
          logger.error(
            `Failed to send email to ${recipient.email}:`,
            emailError
          );
        }
      }

      // Update final status
      const finalStatus =
        failedCount === 0
          ? "delivered"
          : deliveredCount === 0
          ? "failed"
          : "sent";

      await notificationRepository.updateById(notificationId, {
        "delivery.status": finalStatus,
        "delivery.deliveredCount": deliveredCount,
        "delivery.failedCount": failedCount,
      });

      logger.info(
        `Notification sent: ${notification.notificationId} - Delivered: ${deliveredCount}, Failed: ${failedCount}`
      );

      return {
        message: "Notification sent successfully",
        delivered: deliveredCount,
        failed: failedCount,
        failedRecipients:
          failedRecipients.length > 0 ? failedRecipients : undefined,
      };
    } catch (error) {
      logger.error("Send notification failed:", error);

      // Update status to failed
      try {
        await notificationRepository.updateById(notificationId, {
          "delivery.status": "failed",
        });
      } catch (updateError) {
        logger.error(
          "Failed to update notification status to failed:",
          updateError
        );
      }

      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId) {
    try {
      const notification = await notificationRepository.findById(
        notificationId
      );

      if (!notification) {
        throw new ApiError("Notification not found", 404);
      }

      return notification;
    } catch (error) {
      logger.error("Get notification by ID failed:", error);
      throw error;
    }
  }

  /**
   * Update notification
   */
  async updateNotification(notificationId, updateData, updatedBy) {
    try {
      const existingNotification = await notificationRepository.findById(
        notificationId,
        false
      );

      if (!existingNotification) {
        throw new ApiError("Notification not found", 404);
      }

      // Prevent updates to sent notifications
      if (
        ["sent", "delivered"].includes(existingNotification.delivery.status)
      ) {
        throw new ApiError(
          "Cannot update notifications that have been sent",
          400
        );
      }

      const enrichedUpdateData = {
        ...updateData,
        lastModifiedBy: updatedBy,
      };

      const updatedNotification = await notificationRepository.updateById(
        notificationId,
        enrichedUpdateData
      );

      logger.info(
        `Notification updated: ${updatedNotification.notificationId} by user ${updatedBy}`
      );

      return updatedNotification;
    } catch (error) {
      logger.error("Update notification failed:", error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, deletedBy) {
    try {
      const notification = await notificationRepository.findById(
        notificationId,
        false
      );

      if (!notification) {
        throw new ApiError("Notification not found", 404);
      }

      // Only allow deletion of draft or failed notifications
      if (
        !["draft", "failed", "cancelled"].includes(notification.delivery.status)
      ) {
        throw new ApiError(
          "Only draft, failed, or cancelled notifications can be deleted",
          400
        );
      }

      await notificationRepository.deleteById(notificationId);

      logger.info(
        `Notification deleted: ${notification.notificationId} by user ${deletedBy}`
      );

      return { message: "Notification deleted successfully" };
    } catch (error) {
      logger.error("Delete notification failed:", error);
      throw error;
    }
  }

  /**
   * Get notifications with filters
   */
  async getNotifications(options) {
    try {
      const result = await notificationRepository.findWithFilters({}, options);
      return result;
    } catch (error) {
      logger.error("Get notifications list failed:", error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new ApiError("User not found", 404);
      }

      const notifications = await notificationRepository.findByUser(
        userId,
        options.status,
        options.limit || 50
      );

      return notifications;
    } catch (error) {
      logger.error("Get user notifications failed:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read for user
   */
  async markNotificationAsRead(
    notificationId,
    userId,
    userAgent = null,
    ipAddress = null
  ) {
    try {
      const notification = await notificationRepository.findById(
        notificationId,
        false
      );

      if (!notification) {
        throw new ApiError("Notification not found", 404);
      }

      // Check if user is a recipient
      const isRecipient = notification.recipients.users.some(
        (r) => r.user.toString() === userId.toString()
      );

      if (!isRecipient) {
        throw new ApiError("User is not a recipient of this notification", 403);
      }

      await notificationRepository.markOpened(
        notificationId,
        userId,
        userAgent,
        ipAddress
      );

      return { message: "Notification marked as read" };
    } catch (error) {
      logger.error("Mark notification as read failed:", error);
      throw error;
    }
  }

  /**
   * Record notification click
   */
  async recordNotificationClick(
    notificationId,
    userId,
    userAgent = null,
    ipAddress = null
  ) {
    try {
      const notification = await notificationRepository.findById(
        notificationId,
        false
      );

      if (!notification) {
        throw new ApiError("Notification not found", 404);
      }

      await notificationRepository.recordClick(
        notificationId,
        userId,
        userAgent,
        ipAddress
      );

      return { message: "Click recorded successfully" };
    } catch (error) {
      logger.error("Record notification click failed:", error);
      throw error;
    }
  }

  /**
   * Process pending notifications (called by scheduler)
   */
  async processPendingNotifications() {
    try {
      const pendingNotifications = await notificationRepository.findPending();

      logger.info(
        `Processing ${pendingNotifications.length} pending notifications`
      );

      let processedCount = 0;
      let failedCount = 0;

      for (const notification of pendingNotifications) {
        try {
          await this.sendNotification(notification._id);
          processedCount++;
        } catch (error) {
          failedCount++;
          logger.error(
            `Failed to send pending notification ${notification.notificationId}:`,
            error
          );
        }
      }

      logger.info(
        `Processed ${processedCount} notifications, ${failedCount} failed`
      );

      return {
        total: pendingNotifications.length,
        processed: processedCount,
        failed: failedCount,
      };
    } catch (error) {
      logger.error("Process pending notifications failed:", error);
      throw error;
    }
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications() {
    try {
      const failedNotifications = await notificationRepository.findForRetry();

      logger.info(
        `Retrying ${failedNotifications.length} failed notifications`
      );

      let retriedCount = 0;
      let stillFailedCount = 0;

      for (const notification of failedNotifications) {
        try {
          // Increment retry count
          await notificationRepository.updateById(notification._id, {
            "delivery.retryCount": (notification.delivery.retryCount || 0) + 1,
            "delivery.lastRetryAt": new Date(),
            "delivery.status": "queued",
          });

          await this.sendNotification(notification._id);
          retriedCount++;
        } catch (error) {
          stillFailedCount++;
          logger.error(
            `Failed to retry notification ${notification.notificationId}:`,
            error
          );
        }
      }

      logger.info(
        `Retried ${retriedCount} notifications, ${stillFailedCount} still failed`
      );

      return {
        total: failedNotifications.length,
        retried: retriedCount,
        stillFailed: stillFailedCount,
      };
    } catch (error) {
      logger.error("Retry failed notifications failed:", error);
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId, reason, cancelledBy) {
    try {
      const notification = await notificationRepository.findById(
        notificationId,
        false
      );

      if (!notification) {
        throw new ApiError("Notification not found", 404);
      }

      // Only allow cancellation of draft or queued notifications
      if (!["draft", "queued"].includes(notification.delivery.status)) {
        throw new ApiError(
          "Only draft or queued notifications can be cancelled",
          400
        );
      }

      await notificationRepository.updateById(notificationId, {
        "delivery.status": "cancelled",
        "metadata.cancellationReason": reason,
        lastModifiedBy: cancelledBy,
      });

      logger.info(
        `Notification cancelled: ${notification.notificationId} by user ${cancelledBy}. Reason: ${reason}`
      );

      return { message: "Notification cancelled successfully" };
    } catch (error) {
      logger.error("Cancel notification failed:", error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(dateFrom = null, dateTo = null) {
    try {
      return await notificationRepository.getNotificationStats(
        dateFrom,
        dateTo
      );
    } catch (error) {
      logger.error("Get notification stats failed:", error);
      throw error;
    }
  }

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(filters = {}) {
    try {
      return await notificationRepository.findForAnalytics(filters);
    } catch (error) {
      logger.error("Get notification analytics failed:", error);
      throw error;
    }
  }

  /**
   * Create batch notifications
   */
  async createBatchNotifications(notificationsData, createdBy, batchId = null) {
    try {
      // Generate batch ID if not provided
      if (!batchId) {
        batchId = `BATCH-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }

      const notifications = [];
      const errors = [];

      for (let i = 0; i < notificationsData.length; i++) {
        try {
          const notificationData = {
            ...notificationsData[i],
            metadata: {
              ...notificationsData[i].metadata,
              batchId,
              batchIndex: i,
            },
          };

          const notification = await this.createNotification(
            notificationData,
            createdBy
          );
          notifications.push(notification);
        } catch (error) {
          errors.push({
            index: i,
            error: error.message,
            data: notificationsData[i],
          });
        }
      }

      logger.info(
        `Batch notifications created: ${notifications.length} successful, ${errors.length} failed. Batch ID: ${batchId}`
      );

      return {
        batchId,
        created: notifications.length,
        failed: errors.length,
        notifications,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      logger.error("Create batch notifications failed:", error);
      throw error;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(testData, createdBy) {
    try {
      const { title, message, htmlContent, testEmail, type } = testData;

      // Create temporary notification data
      const notificationData = {
        type: type || "system_announcement",
        priority: "normal",
        title,
        message,
        htmlContent,
        recipients: {
          users: [
            {
              user: createdBy,
              email: testEmail,
              name: "Test User",
              role: "ntc_admin",
            },
          ],
        },
        delivery: {
          channel: "email",
          status: "draft",
        },
        metadata: {
          source: "manual",
          tags: ["test"],
          category: "test",
        },
      };

      // Send directly without saving to database
      const result = await emailService.sendEmail({
        to: testEmail,
        subject: title,
        text: message,
        html: htmlContent || emailService.generateDefaultHtml(title, message),
        priority: "normal",
      });

      if (result.success) {
        logger.info(
          `Test notification sent to ${testEmail} by user ${createdBy}`
        );
        return {
          message: "Test notification sent successfully",
          messageId: result.messageId,
        };
      } else {
        throw new ApiError(
          `Failed to send test notification: ${result.error}`,
          500
        );
      }
    } catch (error) {
      logger.error("Send test notification failed:", error);
      throw error;
    }
  }

  /**
   * Bulk update notification status
   */
  async bulkUpdateNotificationStatus(
    notificationIds,
    status,
    reason,
    updatedBy
  ) {
    try {
      const results = {
        updated: 0,
        failed: 0,
        errors: [],
      };

      for (const notificationId of notificationIds) {
        try {
          await notificationRepository.updateById(notificationId, {
            "delivery.status": status,
            "metadata.statusChangeReason": reason,
            lastModifiedBy: updatedBy,
          });
          results.updated++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            notificationId,
            error: error.message,
          });
        }
      }

      logger.info(
        `Bulk status update: ${results.updated} updated, ${results.failed} failed`
      );

      return results;
    } catch (error) {
      logger.error("Bulk update notification status failed:", error);
      throw error;
    }
  }

  /**
   * Get user notification count
   */
  async getUserNotificationCount(userId, filters = {}) {
    try {
      return await notificationRepository.getUserNotificationCount(
        userId,
        filters
      );
    } catch (error) {
      logger.error("Get user notification count failed:", error);
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications() {
    try {
      const result = await notificationRepository.cleanupExpired();
      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      logger.error("Cleanup expired notifications failed:", error);
      throw error;
    }
  }

  /**
   * Get notifications by related data
   */
  async getNotificationsByRelatedData(type, entityId) {
    try {
      if (!["trip", "route", "bus", "operator"].includes(type)) {
        throw new ApiError("Invalid related data type", 400);
      }

      return await notificationRepository.findByRelatedData(type, entityId);
    } catch (error) {
      logger.error("Get notifications by related data failed:", error);
      throw error;
    }
  }

  /**
   * Resolve recipient groups to individual users
   */
  async resolveRecipientGroups(groups) {
    try {
      const resolvedUsers = [];

      for (const group of groups) {
        let users = [];

        switch (group) {
          case "all_users":
            users = await userRepository.findAllActiveUsers();
            break;
          case "ntc_admins":
            users = await userRepository.findUsersByRole("ntc_admin");
            break;
          case "bus_operators":
            users = await userRepository.findUsersByRole("bus_operator");
            break;
          case "commuters":
            users = await userRepository.findUsersByRole("commuter");
            break;
          case "route_subscribers":
            // This would need additional logic to find users subscribed to specific routes
            users = await userRepository.findUsersByPreference(
              "route_notifications",
              true
            );
            break;
          default:
            logger.warn(`Unknown recipient group: ${group}`);
            continue;
        }

        // Convert users to recipient format
        const groupRecipients = users.map((user) => ({
          user: user._id,
          email: user.email,
          name: user.profile?.firstName
            ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
            : user.email,
          role: user.role,
        }));

        resolvedUsers.push(...groupRecipients);
      }

      return resolvedUsers;
    } catch (error) {
      logger.error("Resolve recipient groups failed:", error);
      throw error;
    }
  }

  /**
   * Generate HTML content for notification
   */
  generateHtmlContent(notification) {
    try {
      return emailService.generateNotificationHtml(notification, {
        name: "Recipient",
        email: "recipient@example.com",
      });
    } catch (error) {
      logger.error("Generate HTML content failed:", error);
      return null;
    }
  }

  /**
   * Validate notification data
   */
  validateNotificationData(notificationData) {
    const errors = [];

    // Basic validation
    if (!notificationData.title) {
      errors.push("Title is required");
    }

    if (!notificationData.message) {
      errors.push("Message is required");
    }

    if (
      !notificationData.recipients ||
      (!notificationData.recipients.users?.length &&
        !notificationData.recipients.groups?.length)
    ) {
      errors.push("At least one recipient or recipient group is required");
    }

    // Validate scheduled time
    if (notificationData.delivery?.scheduledFor) {
      const scheduledTime = new Date(notificationData.delivery.scheduledFor);
      if (scheduledTime <= new Date()) {
        errors.push("Scheduled time must be in the future");
      }
    }

    // Validate expiration time
    if (notificationData.settings?.expiresAt) {
      const expirationTime = new Date(notificationData.settings.expiresAt);
      if (expirationTime <= new Date()) {
        errors.push("Expiration time must be in the future");
      }
    }

    if (errors.length > 0) {
      throw new ApiError(`Validation failed: ${errors.join(", ")}`, 400);
    }

    return true;
  }

  /**
   * Check user permissions for notification operations
   */
  async checkUserPermissions(userId, operation, notificationId = null) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      // NTC admins can perform all operations
      if (user.role === "ntc_admin") {
        return true;
      }

      // Bus operators can create notifications for their routes/trips
      if (user.role === "bus_operator") {
        if (["create", "update"].includes(operation)) {
          return true;
        }

        // Can only read/manage their own notifications
        if (notificationId && ["read", "delete"].includes(operation)) {
          const notification = await notificationRepository.findById(
            notificationId,
            false
          );
          return (
            notification &&
            notification.createdBy.toString() === userId.toString()
          );
        }
      }

      // Commuters can only read notifications sent to them
      if (user.role === "commuter" && operation === "read") {
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Check user permissions failed:", error);
      throw error;
    }
  }

  /**
   * Format notification for response
   */
  formatNotificationResponse(notification) {
    if (!notification) return null;

    return {
      id: notification._id,
      notificationId: notification.notificationId,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      htmlContent: notification.htmlContent,
      recipients: {
        total: notification.recipients.totalRecipients,
        users: notification.recipients.users?.map((user) => ({
          id: user.user?._id || user.user,
          email: user.email,
          name: user.name,
          role: user.role,
          delivered: user.delivered,
          deliveredAt: user.deliveredAt,
          opened: user.opened,
          openedAt: user.openedAt,
        })),
      },
      delivery: {
        status: notification.delivery.status,
        channel: notification.delivery.channel,
        scheduledFor: notification.delivery.scheduledFor,
        sentAt: notification.delivery.sentAt,
        deliveredCount: notification.delivery.deliveredCount,
        failedCount: notification.delivery.failedCount,
        openedCount: notification.delivery.openedCount,
        clickedCount: notification.delivery.clickedCount,
        retryCount: notification.delivery.retryCount,
      },
      relatedData: notification.relatedData,
      settings: notification.settings,
      metadata: notification.metadata,
      analytics: {
        deliveryRate: notification.deliveryRate,
        openRate: notification.openRate,
        clickRate: notification.clickRate,
      },
      statusSummary: notification.statusSummary,
      createdBy: notification.createdBy,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}

module.exports = new NotificationService();
