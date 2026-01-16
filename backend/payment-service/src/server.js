// Load shared environment config FIRST
const config = require('./config/env');

// Set DATABASE_URL for Prisma (must be done before importing app)
process.env.DATABASE_URL = config.databaseUrl;

const app = require('./app');
const { initializeRazorpay } = require('./config/razorpay');
const prisma = require('./config/prisma');

const PORT = config.port;
const SERVICE_NAME = config.serviceName;

// Initialize Razorpay
try {
  initializeRazorpay();
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.warn('⚠️  Razorpay initialization skipped:', error.message);
  console.warn('⚠️  Payment service will run in limited mode');
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} is running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('✅ HTTP server closed');

    try {
      await prisma.$disconnect();
      console.log('✅ Database connections closed');

      console.log('👋 Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = server;
