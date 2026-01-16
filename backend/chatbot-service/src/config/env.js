require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3012,

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET,

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3
  },

  // Service URLs
  services: {
    crmsync: process.env.CRMSYNC_SERVICE_URL || 'http://localhost:3011'
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000
  },

  // Session
  sessionTimeoutHours: parseInt(process.env.SESSION_TIMEOUT_HOURS, 10) || 24
};

// Validate required config
const requiredConfig = ['databaseUrl'];
for (const key of requiredConfig) {
  if (!config[key]) {
    console.warn(`Warning: ${key} is not set in environment variables`);
  }
}

module.exports = config;
