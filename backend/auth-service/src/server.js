// Load environment configuration FIRST (before anything else)
// This loads the shared backend/.env and constructs the DATABASE_URL
const { env } = require('./config/env');

// Set DATABASE_URL for Prisma and pg (must be done before importing app)
process.env.DATABASE_URL = env.DATABASE_URL;

const app = require('./app');
const db = require('./config/database');

const PORT = env.PORT;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    console.log('🔍 Validating environment configuration...');
    console.log(`✅ Environment: ${env.NODE_ENV}`);
    console.log(`✅ Port: ${PORT}`);

    console.log('🔌 Connecting to database...');
    await db.connectDB();
    console.log('✅ Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log('=========================================');
      console.log(`🚀 Auth Service running on port ${PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
      console.log(`🔐 JWT configured with ${env.JWT_REFRESH_SECRET ? 'separate' : 'same'} refresh secret`);
      console.log(`📧 Email service: ${env.SMTP_HOST ? 'enabled' : 'disabled'}`);
      console.log(`🔗 User service: ${env.USER_SERVICE_URL || 'not configured'}`);
      console.log('=========================================');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      console.error(err.stack);
      server.close(() => {
        console.log('🛑 Server closed due to unhandled rejection');
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n👋 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start Auth Service:');
    console.error(error);
    process.exit(1);
  }
};

startServer();
