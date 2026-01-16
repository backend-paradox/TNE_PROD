const { URL } = require('url');
const fetch = require('node-fetch');
const http = require('http');
const https = require('https');
const opossum = require('opossum');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const jwtMiddleware = require('../middleware/jwt');
const metrics = require('../utils/metrics');

// Environment configs
const UPSTREAM_TIMEOUT = parseInt(process.env.UPSTREAM_TIMEOUT_MS || '15000', 10);
const UPSTREAM_RETRY = parseInt(process.env.UPSTREAM_RETRY || '2', 10);
const CIRCUIT_ERROR_THRESHOLD = parseInt(process.env.CIRCUIT_ERROR_THRESHOLD || '50', 10);
const CIRCUIT_RESET_TIMEOUT = parseInt(process.env.CIRCUIT_RESET_TIMEOUT_MS || '30000', 10);

/**
 * Stream multipart requests directly to upstream (for file uploads)
 * This pipes the request body without consuming it
 */
function streamMultipartProxy(req, res, parsedBaseUrl, upstreamPath, traceId) {
  return new Promise((resolve, reject) => {
    const protocol = parsedBaseUrl.protocol === 'https:' ? https : http;
    const port = parsedBaseUrl.port || (parsedBaseUrl.protocol === 'https:' ? 443 : 80);

    const options = {
      hostname: parsedBaseUrl.hostname,
      port: port,
      path: upstreamPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: parsedBaseUrl.host,
        'x-request-id': traceId,
      },
    };

    const proxyReq = protocol.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => {
        data += chunk;
      });
      proxyRes.on('end', () => {
        resolve({
          status: proxyRes.statusCode,
          headers: proxyRes.headers,
          body: data,
        });
      });
    });

    proxyReq.on('error', (err) => {
      logger.error(`Multipart proxy error: ${err.message}`);
      reject(err);
    });

    // Set timeout
    proxyReq.setTimeout(UPSTREAM_TIMEOUT, () => {
      proxyReq.destroy();
      reject(new Error('Upstream timeout'));
    });

    // Pipe the incoming request body directly to the upstream request
    req.pipe(proxyReq);
  });
}

/**
 * Create a service proxy handler with:
 * - retry logic
 * - timeout
 * - circuit breaker
 * - structured logs
 * - JSON body forwarding
 * - Multipart form data support for file uploads (via streaming)
 */
function makeServiceProxy(basePath, baseUrl) {
  let parsedBaseUrl = null;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch (err) {
    logger.error(`Invalid upstream base URL for ${basePath}: ${baseUrl} (${err.message})`);
  }

  // Wrapper function used by opossum circuit breaker
  async function callUpstream({ method, path, headers, body, timeout, rawBody, isMultipart }) {
    const url = new URL(path, parsedBaseUrl).toString();
    let lastErr;

    // Primitive retry mechanism
    for (let attempt = 0; attempt <= UPSTREAM_RETRY; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout || UPSTREAM_TIMEOUT);

        const hasBody = !['GET', 'HEAD'].includes(method) &&
          body !== undefined &&
          body !== null &&
          !(typeof body === 'object' && Object.keys(body).length === 0);

        let requestBody;
        if (isMultipart && rawBody) {
          // For multipart form data, use raw body buffer
          requestBody = rawBody;
        } else if (hasBody) {
          requestBody = JSON.stringify(body);
        }

        const options = {
          method,
          headers,
          signal: controller.signal,
          body: requestBody,
        };

        const resp = await fetch(url, options);
        clearTimeout(timer);
        return resp;

      } catch (err) {
        lastErr = err;
        logger.warn(
          `Upstream call failed [${method}] ${url} (Attempt: ${attempt}) - ${err.message}`
        );
        // backoff
        await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
      }
    }

    throw lastErr;
  }

  // Circuit breaker
  const breaker = new opossum(callUpstream, {
    timeout: UPSTREAM_TIMEOUT + 2000,
    errorThresholdPercentage: CIRCUIT_ERROR_THRESHOLD,
    resetTimeout: CIRCUIT_RESET_TIMEOUT,
  });

  // Circuit breaker metrics
  breaker.on('success', () => metrics.circuitSuccess.inc({ service: basePath }));
  breaker.on('failure', () => metrics.circuitFailure.inc({ service: basePath }));
  breaker.on('open', () => logger.warn(`Circuit OPEN for: ${basePath}`));
  breaker.on('close', () => logger.info(`Circuit CLOSED for: ${basePath}`));
  breaker.on('halfOpen', () => logger.info(`Circuit HALF-OPEN for: ${basePath}`));

  return async function proxyHandler(req, res) {
    // Debug: Log request details for file uploads
    const debugContentType = req.headers['content-type'] || '';
    if (debugContentType.includes('multipart') || req.url.includes('avatar')) {
      logger.info(`[DEBUG] Proxy request: ${req.method} ${req.url}`);
      logger.info(`[DEBUG] Content-Type: ${debugContentType}`);
      logger.info(`[DEBUG] Content-Length: ${req.headers['content-length']}`);
    }

    if (!parsedBaseUrl) {
      // SECURITY: Don't expose internal details to client
      logger.error(`Gateway misconfiguration: Invalid upstream URL for ${basePath}`);
      return res.status(500).json({
        error: 'Service temporarily unavailable',
      });
    }

    const traceId = uuidv4();
    const method = req.method;

    let upstreamPath = req.originalUrl || req.url || '/';
    if (upstreamPath.startsWith('http://') || upstreamPath.startsWith('https://')) {
      try {
        const parsed = new URL(upstreamPath);
        upstreamPath = `${parsed.pathname}${parsed.search}`;
      } catch (err) {
        logger.warn(`Invalid absolute URL received at gateway: ${upstreamPath} (${err.message})`);
        upstreamPath = '/';
      }
    }
    if (!upstreamPath.startsWith('/')) {
      upstreamPath = `/${upstreamPath}`;
    }

    // Check if request is multipart form data (file upload)
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    const headers = {
      ...req.headers,
      host: parsedBaseUrl.host,
      'x-request-id': traceId,
    };

    // For non-multipart requests, set JSON content-type if body exists
    if (!isMultipart && req.body && Object.keys(req.body).length > 0) {
      headers['content-type'] = 'application/json';
    }

    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    const endTimer = metrics.requestDuration.labels({
      route: basePath,
      method,
    }).startTimer();

    try {
      // For multipart requests (file uploads), use streaming proxy to avoid consuming the body
      if (isMultipart) {
        logger.info(`Streaming multipart request to ${basePath}: ${upstreamPath}`);
        const upstreamResponse = await streamMultipartProxy(req, res, parsedBaseUrl, upstreamPath, traceId);

        res.status(upstreamResponse.status);

        // Copy response headers
        for (const [key, value] of Object.entries(upstreamResponse.headers)) {
          if (!['transfer-encoding', 'connection', 'keep-alive', 'content-length'].includes(key)) {
            res.setHeader(key, value);
          }
        }

        endTimer();

        try {
          return res.send(JSON.parse(upstreamResponse.body));
        } catch {
          return res.send(upstreamResponse.body);
        }
      }

      // For non-multipart requests, use circuit breaker
      const upstreamResponse = await breaker.fire({
        method,
        path: upstreamPath,
        headers,
        body: req.body,
        timeout: UPSTREAM_TIMEOUT,
      });

      res.status(upstreamResponse.status);

      // Get content type from upstream response
      const upstreamContentType = upstreamResponse.headers.get('content-type') || '';

      upstreamResponse.headers.forEach((value, key) => {
        if (!['transfer-encoding', 'connection', 'keep-alive', 'content-length'].includes(key)) {
          res.setHeader(key, value);
        }
      });

      // Handle binary responses (audio, images, etc.)
      if (upstreamContentType.includes('audio/') ||
          upstreamContentType.includes('image/') ||
          upstreamContentType.includes('application/octet-stream')) {
        const buffer = await upstreamResponse.buffer();
        endTimer();
        return res.send(buffer);
      }

      const responseText = await upstreamResponse.text();
      endTimer();

      try {
        return res.send(JSON.parse(responseText));
      } catch {
        return res.send(responseText);
      }

    } catch (err) {
      endTimer();
      // Log full error details for debugging
      logger.error(`Proxy error (${basePath} -> ${baseUrl}): ${err.message}`, {
        traceId,
        errorName: err.name,
        stack: err.stack
      });

      // SECURITY: Don't expose internal error details to client
      if (err.name === "AbortError") {
        return res.status(504).json({
          error: "Gateway timeout",
          message: "The upstream service took too long to respond",
          traceId
        });
      }

      if (err.message?.includes("ENOTFOUND") || err.message?.includes("ECONNREFUSED")) {
        return res.status(502).json({
          error: "Service unavailable",
          message: "The requested service is currently unavailable",
          traceId
        });
      }

      // Generic error - don't expose internal details
      return res.status(502).json({
        error: "Service error",
        message: "An error occurred while processing your request",
        traceId
      });
    }
  };
}

module.exports = function(app) {

  // Attach JWT middleware globally (optional mode)
  app.use(jwtMiddleware.optional);

  /**
   * ADMIN PROTECTED ROUTES
   * Only admins can access internal user CRUD
   */
  if (process.env.USER_SERVICE_URL) {
    const userServiceHandler = makeServiceProxy(
      '/api/v1/users',
      process.env.USER_SERVICE_URL
    );

    app.use(
      '/api/v1/users/admin',
      jwtMiddleware.required,
      jwtMiddleware.requireRole('admin'),
      userServiceHandler
    );
  }

  /**
   * Dynamic microservice routing
   * Only active services are configured
   */
  const services = {
    // Authentication & User Management
    '/api/v1/auth': process.env.AUTH_SERVICE_URL,
    '/api/v1/users': process.env.USER_SERVICE_URL,

    // Business Services
    '/api/v1/bookings': process.env.BOOKING_SERVICE_URL,
    '/api/v1/cart': process.env.BOOKING_SERVICE_URL,
    '/api/v1/wishlist': process.env.BOOKING_SERVICE_URL,
    '/api/v1/payments': process.env.PAYMENT_SERVICE_URL,
    '/api/v1/notifications': process.env.NOTIFICATION_SERVICE_URL,
    '/api/v1/crmsync': process.env.CRMSYNC_SERVICE_URL,

    // Communication & Collaboration Services
    '/api/v1/chat': process.env.CHAT_SERVICE_URL,
    '/api/v1/groups': process.env.GROUP_SERVICE_URL,

    // AI Chatbot Service
    '/api/v1/chatbot': process.env.CHATBOT_SERVICE_URL,

    // Package Service (Tour & CineTrip Packages)
    '/api/v1/tour-packages': process.env.PACKAGE_SERVICE_URL,
    '/api/v1/cinetrip-packages': process.env.PACKAGE_SERVICE_URL,
    '/api/v1/destinations': process.env.PACKAGE_SERVICE_URL,
    '/api/v1/seed': process.env.PACKAGE_SERVICE_URL,
  };

  for (const [path, url] of Object.entries(services)) {
    if (!url) {
      logger.warn(`Service not configured: ${path} (no URL provided)`);
      continue;
    }

    const handler = makeServiceProxy(path, url);

    // Support /api/v1/... and /api/v1/.../*
    app.all(`${path}/*`, handler);
    app.all(path, handler);

    logger.info(`✓ Proxy configured: ${path} -> ${url}`);
  }
};
