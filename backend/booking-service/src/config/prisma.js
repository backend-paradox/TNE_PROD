const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Handle connection errors
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Booking Service: Database connected');
    }
  })
  .catch((err) => {
    console.error('✗ Booking Service: Database connection failed:', err);
    process.exit(1);
  });

module.exports = prisma;
