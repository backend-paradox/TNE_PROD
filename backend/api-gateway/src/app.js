// backend/api-gateway/src/app.js
// Import shared environment config (already loaded in server.js, this reuses the cached version)
const { env } = require('./config/env');
require('express-async-errors'); // auto-catch async errors
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const requestId = require('./middleware/requestId');
const metrics = require('./utils/metrics');
const errorHandler = require('./middleware/errorHandler');
const setupProxies = require('./routes/proxy');

// Environment validation is handled in config/env.js

const app = express();

// security headers
app.use(helmet());
app.set('trust proxy', 1);

// request id
app.use(requestId);

// ==================== CORS Configuration ====================
// SECURITY: Define explicit allowed origins - never use wildcards
const DEV_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];

const configuredOrigins = (env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);

// In development, merge configured origins with dev defaults
// In production, ONLY use configured origins (no fallbacks)
const allowedOrigins = env.isProduction
  ? configuredOrigins
  : [...new Set([...configuredOrigins, ...DEV_ALLOWED_ORIGINS])];

// SECURITY: Fail fast in production if no origins configured
if (env.isProduction && allowedOrigins.length === 0) {
  logger.error('[SECURITY] FATAL: FRONTEND_URL must be set in production for CORS');
  process.exit(1);
}

app.use(cors({
  origin: function(origin, cb) {
    // Handle requests without origin header (Postman, curl, server-to-server)
    if (!origin) {
      if (env.isProduction) {
        // SECURITY: In production, reject requests without origin
        logger.warn('[CORS] Rejected request without Origin header (production mode)');
        return cb(new Error('Origin header required'));
      }
      // In development, allow for testing tools
      return cb(null, true);
    }

    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    // Log and reject unauthorized origins
    logger.warn(`[CORS] Blocked unauthorized origin: ${origin}`, {
      allowedOrigins: allowedOrigins.slice(0, 3), // Log first 3 for debugging
    });
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400, // Cache preflight responses for 24 hours
}));

// ==================== Body Parsers ====================
// SECURITY: Reduced body size limits
// NOTE: For multipart/form-data (file uploads), skip body parsing entirely
// The proxy will stream the request directly to upstream services

// JSON parser (skip for multipart to allow streaming)
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next(); // Skip - will be streamed by proxy
  }
  express.json({ limit: '1mb' })(req, res, next);
});

// URL-encoded parser (skip for multipart to allow streaming)
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next(); // Skip - will be streamed by proxy
  }
  express.urlencoded({ extended: true, limit: '1mb' })(req, res, next);
});

// logging (morgan -> winston)
app.use(morgan('combined', { stream: logger.stream }));

// ==================== Rate Limiting ====================
const windowMs = env.RATE_LIMIT_WINDOW_MS || 60000;
const max = env.RATE_LIMIT_MAX || 200;

app.use(rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  // SECURITY: Use X-Forwarded-For with validation when behind proxy
  keyGenerator: (req) => {
    // Prefer user ID for authenticated requests
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    // Use IP for unauthenticated requests
    // req.ip already handles X-Forwarded-For when trust proxy is set
    return `ip:${req.ip}`;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
}));

// attach proxies
setupProxies(app);

// /health and /ready
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));
app.get('/ready', (req, res) => res.json({ status: 'ready' }));

// prom metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  } catch (e) {
    logger.error(`Metrics error: ${e.message}`);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// error handler
app.use(errorHandler);

module.exports = app;
