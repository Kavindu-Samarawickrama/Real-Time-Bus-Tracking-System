// src/utils/emailService.js
const nodemailer = require("nodemailer");
const logger = require("./logger");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initialize();
  }

  /**
   * Initialize Gmail transporter
   */
  async initialize() {
    try {
      // Validate required environment variables
      const requiredEnvVars = ["GMAIL_USER", "GMAIL_APP_PASSWORD"];

      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
      );

      if (missingVars.length > 0) {
        logger.error(
          `Missing required environment variables for Gmail: ${missingVars.join(
            ", "
          )}`
        );
        return;
      }

      // Create Gmail transporter - FIXED: changed createTransporter to createTransport
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, // App-specific password
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify transporter configuration
      await this.transporter.verify();
      this.initialized = true;

      logger.info("Gmail email service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Gmail service:", error);
      this.initialized = false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(emailData) {
    try {
      if (!this.initialized) {
        await this.initialize();

        if (!this.initialized) {
          throw new Error("Email service not initialized");
        }
      }

      const {
        to,
        subject,
        text,
        html,
        cc = null,
        bcc = null,
        attachments = null,
        notificationId = null,
        userId = null,
        priority = "normal",
      } = emailData;

      // Validate required fields
      if (!to || !subject || (!text && !html)) {
        throw new Error(
          "Missing required email fields: to, subject, and text/html"
        );
      }

      // Prepare email options
      const mailOptions = {
        from: {
          name: "NTC Bus Tracking",
          address: process.env.GMAIL_USER,
        },
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        text,
        html: html || this.generateDefaultHtml(subject, text),
        cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
        attachments,
        // Add tracking headers if notification ID provided
        headers: {
          "X-Notification-ID": notificationId || "",
          "X-User-ID": userId || "",
          "X-Mailer": "NTC Bus Tracking System",
          "X-Priority": this.getPriorityNumber(priority),
        },
        priority:
          priority === "urgent" || priority === "critical" ? "high" : "normal",
      };

      // Remove undefined properties
      Object.keys(mailOptions).forEach((key) => {
        if (mailOptions[key] === undefined) {
          delete mailOptions[key];
        }
      });

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      logger.info(
        `Email sent successfully to ${to}. Message ID: ${info.messageId}`
      );

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        envelope: info.envelope,
      };
    } catch (error) {
      logger.error(`Failed to send email to ${emailData.to}:`, error);

      return {
        success: false,
        error: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails, options = {}) {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
      messageIds: [],
    };

    const {
      delay = 1000, // Delay between emails in ms to avoid rate limits
      maxConcurrent = 3, // Maximum concurrent emails (reduced for Gmail limits)
      retryAttempts = 2,
    } = options;

    try {
      logger.info(`Starting bulk email send for ${emails.length} emails`);

      // Process emails in batches to respect Gmail limits
      for (let i = 0; i < emails.length; i += maxConcurrent) {
        const batch = emails.slice(i, i + maxConcurrent);

        const batchPromises = batch.map(async (emailData, batchIndex) => {
          const emailIndex = i + batchIndex;
          let attempts = 0;

          while (attempts <= retryAttempts) {
            try {
              // Add progressive delay to avoid overwhelming Gmail
              if (delay > 0) {
                await new Promise((resolve) =>
                  setTimeout(resolve, delay + batchIndex * 200)
                );
              }

              const result = await this.sendEmail(emailData);

              if (result.success) {
                results.sent++;
                results.messageIds.push(result.messageId);
                logger.info(
                  `Bulk email ${emailIndex + 1}/${
                    emails.length
                  } sent successfully`
                );
                break;
              } else {
                attempts++;
                if (attempts > retryAttempts) {
                  results.failed++;
                  results.errors.push({
                    email: emailData.to,
                    error: result.error,
                    attempt: attempts,
                  });
                } else {
                  logger.warn(
                    `Retrying email ${emailIndex + 1}, attempt ${attempts + 1}`
                  );
                  await new Promise((resolve) =>
                    setTimeout(resolve, 2000 * attempts)
                  ); // Exponential backoff
                }
              }
            } catch (error) {
              attempts++;
              if (attempts > retryAttempts) {
                results.failed++;
                results.errors.push({
                  email: emailData.to,
                  error: error.message,
                  attempt: attempts,
                });
              } else {
                logger.warn(
                  `Retrying email ${emailIndex + 1}, attempt ${attempts + 1}`
                );
                await new Promise((resolve) =>
                  setTimeout(resolve, 2000 * attempts)
                );
              }
            }
          }
        });

        await Promise.all(batchPromises);

        // Add delay between batches
        if (i + maxConcurrent < emails.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      logger.info(
        `Bulk email completed. Sent: ${results.sent}, Failed: ${results.failed}`
      );

      return results;
    } catch (error) {
      logger.error("Bulk email sending failed:", error);
      throw error;
    }
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(template, recipientData, templateVariables = {}) {
    try {
      const { to, name = "User" } = recipientData;

      // Replace template variables
      let subject = template.subject || "NTC Bus Tracking Notification";
      let htmlContent = template.htmlContent || "";
      let textContent = template.textContent || "";

      // Default template variables
      const defaultVariables = {
        recipientName: name,
        currentDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Colombo",
        }),
        currentTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Colombo",
        }),
        currentDateTime: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Colombo",
        }),
        systemName: "NTC Bus Tracking System",
        supportEmail: process.env.GMAIL_USER,
        year: new Date().getFullYear(),
        companyName: "National Transport Commission",
      };

      const allVariables = { ...defaultVariables, ...templateVariables };

      // Replace variables in subject and content
      Object.keys(allVariables).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        const value = allVariables[key] || "";

        subject = subject.replace(placeholder, value);
        htmlContent = htmlContent.replace(placeholder, value);
        textContent = textContent.replace(placeholder, value);
      });

      const emailData = {
        to,
        subject,
        text: textContent,
        html: htmlContent,
        priority: template.priority || "normal",
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      logger.error("Failed to send templated email:", error);
      throw error;
    }
  }

  /**
   * Send notification email with tracking
   */
  async sendNotificationEmail(notification, recipient) {
    try {
      const emailData = {
        to: recipient.email,
        subject: notification.title,
        text: notification.message,
        html:
          notification.htmlContent ||
          this.generateNotificationHtml(notification, recipient),
        notificationId: notification._id,
        userId: recipient.user,
        priority: notification.priority,
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      logger.error("Failed to send notification email:", error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    try {
      const emailData = {
        to: user.email,
        subject: "Welcome to NTC Bus Tracking System",
        html: this.generateWelcomeHtml(user),
        priority: "normal",
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      logger.error("Failed to send welcome email:", error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken, resetUrl) {
    try {
      const emailData = {
        to: user.email,
        subject: "Password Reset - NTC Bus Tracking",
        html: this.generatePasswordResetHtml(user, resetToken, resetUrl),
        priority: "high",
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      logger.error("Failed to send password reset email:", error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(testEmail = null) {
    try {
      const recipient = testEmail || process.env.GMAIL_USER;

      const testEmailData = {
        to: recipient,
        subject: "NTC Bus Tracking - Email Configuration Test",
        text: "This is a test email to verify the email service configuration.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5aa0;">Email Configuration Test</h2>
            <p>This is a test email to verify that the NTC Bus Tracking email service is working correctly.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Test Details:</h3>
              <ul>
                <li><strong>Service:</strong> Gmail</li>
                <li><strong>Sent at:</strong> ${new Date().toISOString()}</li>
                <li><strong>Environment:</strong> ${
                  process.env.NODE_ENV || "development"
                }</li>
                <li><strong>From:</strong> ${process.env.GMAIL_USER}</li>
              </ul>
            </div>
            <p style="color: #28a745; font-weight: bold;">✅ If you received this email, the configuration is working properly!</p>
          </div>
        `,
      };

      const result = await this.sendEmail(testEmailData);

      if (result.success) {
        logger.info("Email configuration test successful");
        return {
          success: true,
          message: "Test email sent successfully",
          messageId: result.messageId,
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error("Email configuration test failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate default HTML content
   */
  generateDefaultHtml(subject, textContent) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            margin: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2c5aa0 0%, #1e3a72 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
          }
          .content {
            padding: 30px 20px;
          }
          .content h2 {
            color: #2c5aa0;
            margin-top: 0;
          }
          .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
          .footer a {
            color: #2c5aa0;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
            }
            .header, .content {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 NTC Bus Tracking</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <div style="white-space: pre-wrap;">${textContent}</div>
          </div>
          <div class="footer">
            <p>This email was sent by the NTC Bus Tracking System.<br>
            National Transport Commission of Sri Lanka</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate notification-specific HTML
   */
  generateNotificationHtml(notification, recipient) {
    const priorityColors = {
      low: "#28a745",
      normal: "#17a2b8",
      high: "#ffc107",
      urgent: "#fd7e14",
      critical: "#dc3545",
    };

    const priorityColor = priorityColors[notification.priority] || "#17a2b8";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            margin: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2c5aa0 0%, #1e3a72 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .priority-indicator {
            background-color: ${priorityColor};
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px 20px;
            border-left: 4px solid ${priorityColor};
          }
          .content h2 {
            color: #2c5aa0;
            margin-top: 0;
          }
          .related-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px solid #e9ecef;
          }
          .related-info h4 {
            margin-top: 0;
            color: #2c5aa0;
          }
          .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
          .footer a {
            color: #2c5aa0;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
            }
            .header, .content {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚌 NTC Bus Tracking</h1>
            <div class="priority-indicator">${
              notification.priority
            } Priority</div>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            <p>Dear ${recipient.name},</p>
            <div style="white-space: pre-wrap; margin: 20px 0;">${
              notification.message
            }</div>
            
            ${
              notification.relatedData?.trip || notification.relatedData?.route
                ? `
            <div class="related-info">
              <h4>Related Information:</h4>
              ${
                notification.relatedData?.trip
                  ? `<p><strong>Trip:</strong> ${
                      notification.relatedData.trip.tripNumber || "N/A"
                    }</p>`
                  : ""
              }
              ${
                notification.relatedData?.route
                  ? `<p><strong>Route:</strong> ${
                      notification.relatedData.route.routeName || "N/A"
                    }</p>`
                  : ""
              }
              ${
                notification.relatedData?.bus
                  ? `<p><strong>Bus:</strong> ${
                      notification.relatedData.bus.registrationNumber || "N/A"
                    }</p>`
                  : ""
              }
            </div>
            `
                : ""
            }
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
              Sent: ${new Date().toLocaleString("en-US", {
                timeZone: "Asia/Colombo",
              })}<br>
              Notification ID: ${notification.notificationId}
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from the NTC Bus Tracking System.<br>
            National Transport Commission of Sri Lanka</p>
            
            ${
              notification.settings?.allowUnsubscribe
                ? `
            <p><a href="#unsubscribe">Manage Notification Preferences</a></p>
            `
                : ""
            }
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome email HTML
   */
  generateWelcomeHtml(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NTC Bus Tracking</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            margin: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .welcome-message {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
          }
          .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .features ul {
            margin: 0;
            padding-left: 20px;
          }
          .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to NTC Bus Tracking!</h1>
            <p>Your account has been successfully created</p>
          </div>
          <div class="content">
            <div class="welcome-message">
              <h3>Hello ${user.profile?.firstName || user.email}!</h3>
              <p>Welcome to the National Transport Commission Bus Tracking System. Your account has been successfully created and is ready to use.</p>
            </div>
            
            <div class="features">
              <h4>What you can do:</h4>
              <ul>
                <li>Track bus locations in real-time</li>
                <li>Get notifications about delays and updates</li>
                <li>Plan your journey with accurate schedules</li>
                <li>Report issues and provide feedback</li>
              </ul>
            </div>

            <p><strong>Account Details:</strong></p>
            <ul>
              <li>Email: ${user.email}</li>
              <li>Role: ${user.role}</li>
              <li>Registered: ${new Date().toLocaleDateString()}</li>
            </ul>

            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for joining NTC Bus Tracking System<br>
            National Transport Commission of Sri Lanka</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset email HTML
   */
  generatePasswordResetHtml(user, resetToken, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            margin: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .reset-button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            background-color: #f8f9fa;
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Dear ${user.profile?.firstName || user.email},</p>
            
            <p>We received a request to reset your password for your NTC Bus Tracking account. If you made this request, please click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            
            <div class="warning">
              <h4>Important Security Information:</h4>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace;">
              ${resetUrl}
            </p>

            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>This email was sent by NTC Bus Tracking System<br>
            National Transport Commission of Sri Lanka</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get priority number for email headers
   */
  getPriorityNumber(priority) {
    const priorities = {
      low: "5",
      normal: "3",
      high: "2",
      urgent: "1",
      critical: "1",
    };
    return priorities[priority] || "3";
  }

  /**
   * Validate email address
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email service status
   */
  getServiceStatus() {
    return {
      initialized: this.initialized,
      service: "Gmail",
      user: process.env.GMAIL_USER || "Not configured",
    };
  }
}

module.exports = new EmailService();
