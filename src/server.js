// src/server.js
// Load environment variables first - before any other imports
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(process.cwd(), '.env'),
  debug: process.env.NODE_ENV === 'development' 
});

// Validate critical environment variables
if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not set in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// Import utilities and middleware
const database = require('./utils/database');
const logger = require('./utils/logger');
const { 
  helmet, 
  cors, 
  generalLimiter, 
  xssClean, 
  mongoSanitization,
  customSecurityHeaders
} = require('./middlewares/security');
const { requestLogger, requestId } = require('./middlewares/logging');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Import routes
const apiRoutes = require('./routes');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Trust proxy for proper IP detection
    this.app.set('trust proxy', 1);

    // Request ID middleware
    this.app.use(requestId);

    // Security middleware
    this.app.use(helmet);
    this.app.use(cors);
    this.app.use(customSecurityHeaders);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    this.app.use(generalLimiter);

    // Request logging
    this.app.use(requestLogger);

    logger.info('Middleware setup completed');
  }

  setupRoutes() {
    // API routes
    this.app.use('/api', apiRoutes);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'NTC Bus Tracking API',
        version: process.env.API_VERSION || 'v1',
        endpoints: {
          api: '/api',
          health: '/api/health',
          users: '/api/users'
        },
        timestamp: new Date().toISOString()
      });
    });

    logger.info('Routes setup completed');
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    logger.info('Error handling setup completed');
  }

  async start() {
    try {
      // Log environment info
      logger.info(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`MongoDB URI configured: ${process.env.MONGODB_URI ? 'Yes' : 'No'}`);
      logger.info(`JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);

      // Connect to database
      await database.connect();

      // Start server
      this.server = this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port} in ${process.env.NODE_ENV || 'development'} mode`);
        logger.info(`API available at http://localhost:${this.port}/api`);
      });

      // Graceful shutdown handlers
      process.on('SIGINT', () => this.shutdown('SIGINT'));
      process.on('SIGTERM', () => this.shutdown('SIGTERM'));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown(signal) {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    // Close server
    if (this.server) {
      this.server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connection
          await database.disconnect();
          logger.info('Database connection closed');
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;