/**
 * Secure HTTP Client for Inter-Service Communication
 *
 * SECURITY: This client provides:
 * - Response schema validation (prevents injection from malformed responses)
 * - Timeout configuration (prevents hanging connections)
 * - Response size limits (prevents memory exhaustion)
 * - Structured error handling
 */

const axios = require('axios');
const { z } = require('zod');
const logger = require('./logger');

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * SecureHttpClient - A wrapper around axios with built-in security features
 */
class SecureHttpClient {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'unknown';

    this.instance = axios.create({
      timeout: options.timeout || DEFAULT_TIMEOUT,
      maxContentLength: MAX_RESPONSE_SIZE,
      maxBodyLength: MAX_RESPONSE_SIZE,
      validateStatus: (status) => status >= 200 && status < 500,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    // Request interceptor for logging
    this.instance.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for logging
    this.instance.interceptors.response.use(
      (response) => {
        const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
        logger.debug(`[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
        return response;
      },
      (error) => {
        const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
        logger.error(`[HTTP] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ERROR (${duration}ms)`, {
          message: error.message,
          code: error.code,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Validate response data against a Zod schema
   */
  validateResponse(response, schema) {
    if (!schema) {
      return response;
    }

    try {
      response.data = schema.parse(response.data);
      return response;
    } catch (error) {
      logger.error(`[HTTP] Response validation failed for ${this.serviceName}`, {
        errors: error.errors,
        data: JSON.stringify(response.data).substring(0, 200),
      });
      throw new Error(`Invalid response from ${this.serviceName}: ${error.message}`);
    }
  }

  /**
   * GET request with optional schema validation
   */
  async get(url, options = {}) {
    const { responseSchema, ...axiosOptions } = options;
    try {
      const response = await this.instance.get(url, axiosOptions);
      return this.validateResponse(response, responseSchema);
    } catch (error) {
      this.handleError(error, 'GET', url);
      throw error;
    }
  }

  /**
   * POST request with optional schema validation
   */
  async post(url, data, options = {}) {
    const { responseSchema, ...axiosOptions } = options;
    try {
      const response = await this.instance.post(url, data, axiosOptions);
      return this.validateResponse(response, responseSchema);
    } catch (error) {
      this.handleError(error, 'POST', url);
      throw error;
    }
  }

  /**
   * PUT request with optional schema validation
   */
  async put(url, data, options = {}) {
    const { responseSchema, ...axiosOptions } = options;
    try {
      const response = await this.instance.put(url, data, axiosOptions);
      return this.validateResponse(response, responseSchema);
    } catch (error) {
      this.handleError(error, 'PUT', url);
      throw error;
    }
  }

  /**
   * DELETE request with optional schema validation
   */
  async delete(url, options = {}) {
    const { responseSchema, ...axiosOptions } = options;
    try {
      const response = await this.instance.delete(url, axiosOptions);
      return this.validateResponse(response, responseSchema);
    } catch (error) {
      this.handleError(error, 'DELETE', url);
      throw error;
    }
  }

  /**
   * Handle and log HTTP errors
   */
  handleError(error, method, url) {
    if (error.code === 'ECONNABORTED') {
      logger.error(`[HTTP] Request timeout: ${method} ${url} (${this.serviceName})`);
    } else if (error.code === 'ECONNREFUSED') {
      logger.error(`[HTTP] Connection refused: ${method} ${url} (${this.serviceName})`);
    } else if (error.response) {
      logger.error(`[HTTP] Request failed: ${method} ${url} - ${error.response.status}`, {
        service: this.serviceName,
        status: error.response.status,
        data: error.response.data,
      });
    }
  }
}

/**
 * Pre-defined response schemas for common inter-service responses
 * SECURITY: These schemas ensure external services return expected data structures
 */
const responseSchemas = {
  // Generic success response
  success: z.object({
    success: z.boolean(),
    message: z.string().optional(),
  }),

  // User profile response (from user-service)
  userProfile: z.object({
    success: z.boolean().optional(),
    data: z.object({
      id: z.number(),
      userId: z.number().optional(),
      name: z.string().nullable().optional(),
      email: z.string().email().optional(),
      phone: z.string().nullable().optional(),
      avatar: z.string().nullable().optional(),
    }).passthrough(),
  }),

  // Package details response (from package-service)
  packageDetails: z.object({
    success: z.boolean().optional(),
    data: z.object({
      id: z.union([z.string(), z.number()]),
      name: z.string().optional(),
      startingPrice: z.number().optional(),
      price: z.number().optional(),
    }).passthrough(),
  }),

  // Payment order response (from payment-service)
  paymentOrder: z.object({
    success: z.boolean(),
    data: z.object({
      orderId: z.string(),
      amount: z.number(),
      currency: z.string(),
    }).passthrough().optional(),
  }),

  // Auth user response (from auth-service)
  authUser: z.object({
    success: z.boolean().optional(),
    data: z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      emailVerified: z.boolean().optional(),
    }).passthrough(),
  }),
};

/**
 * Create a configured HTTP client for a specific service
 */
const createServiceClient = (serviceName, baseURL, options = {}) => {
  const client = new SecureHttpClient({
    serviceName,
    ...options,
  });

  // Override instance defaults with baseURL
  client.instance.defaults.baseURL = baseURL;

  return client;
};

module.exports = {
  SecureHttpClient,
  createServiceClient,
  responseSchemas,
  DEFAULT_TIMEOUT,
  MAX_RESPONSE_SIZE,
};
