const axios = require('axios');
const config = require('../config/env');
const dummyData = require('../data/dummyData');

/**
 * CRM Client with Dummy Data Fallback
 *
 * IMPORTANT: This client attempts to fetch real data from CRM service.
 * If CRM is unavailable, it falls back to dummy/mock data.
 *
 * When CRM APIs become live:
 * - Real-time data will be returned
 * - Dummy data fallback will only trigger on CRM errors
 */
class CRMClient {
  constructor() {
    this.baseUrl = config.services?.crmsync || 'http://localhost:3011';
    this.crmAvailable = false;
    this.lastHealthCheck = 0;
    this.healthCheckInterval = 60000; // Check every 60 seconds

    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1/crmsync/catalog`,
      timeout: 5000, // Reduced timeout for faster fallback
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check CRM health on startup
    this.checkCRMHealth();
  }

  /**
   * Check if CRM service is available
   */
  async checkCRMHealth() {
    try {
      const now = Date.now();
      if (now - this.lastHealthCheck < this.healthCheckInterval && this.lastHealthCheck > 0) {
        return this.crmAvailable;
      }

      await this.client.get('/health', { timeout: 3000 });
      this.crmAvailable = true;
      this.lastHealthCheck = now;
      console.log('CRM Service: Available');
    } catch (error) {
      this.crmAvailable = false;
      this.lastHealthCheck = Date.now();
      console.log('CRM Service: Unavailable - Using dummy data');
    }
    return this.crmAvailable;
  }

  /**
   * Wrapper to handle CRM calls with dummy data fallback
   */
  async withFallback(crmCall, dummyFallback, operationName) {
    // Try CRM first
    try {
      const response = await crmCall();
      return {
        success: true,
        data: response.data.data || response.data,
        source: 'crmsync_service'
      };
    } catch (error) {
      // Log error but don't expose to user
      console.warn(`CRM ${operationName} failed:`, error.message);

      // Use dummy data fallback
      try {
        const data = dummyFallback();
        return {
          success: true,
          data,
          source: 'demo_data' // Indicates dummy data is being used
        };
      } catch (fallbackError) {
        console.error(`Dummy data fallback failed for ${operationName}:`, fallbackError.message);
        return {
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
          source: 'error'
        };
      }
    }
  }

  /**
   * Get all destinations
   */
  async getDestinations() {
    return this.withFallback(
      () => this.client.get('/destinations'),
      () => dummyData.getDestinations(),
      'getDestinations'
    );
  }

  /**
   * Get destination by slug
   */
  async getDestinationBySlug(slug) {
    return this.withFallback(
      () => this.client.get(`/destinations/${slug}`),
      () => dummyData.getDestinationBySlug(slug),
      'getDestinationBySlug'
    );
  }

  /**
   * Search packages with filters
   * @param {object} filters - { destination, tripType, minBudget, maxBudget, travelers, featured }
   */
  async searchPackages(filters = {}) {
    return this.withFallback(
      () => {
        const params = new URLSearchParams();
        if (filters.destination) params.append('destination', filters.destination);
        if (filters.tripType) params.append('tripType', filters.tripType);
        if (filters.minBudget) params.append('minBudget', filters.minBudget);
        if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);
        if (filters.travelers) params.append('travelers', filters.travelers);
        if (filters.featured) params.append('featured', 'true');
        if (filters.limit) params.append('limit', filters.limit);
        return this.client.get(`/packages?${params.toString()}`);
      },
      () => {
        const packages = dummyData.searchPackages(filters);
        return { packages, total: packages.length };
      },
      'searchPackages'
    );
  }

  /**
   * Get package by ID
   */
  async getPackageById(packageId) {
    return this.withFallback(
      () => this.client.get(`/packages/${packageId}`),
      () => dummyData.getPackageById(packageId),
      'getPackageById'
    );
  }

  /**
   * Check package availability
   */
  async checkAvailability(packageId, travelers = 1, date = null) {
    return this.withFallback(
      () => {
        const params = new URLSearchParams();
        params.append('travelers', travelers);
        if (date) params.append('date', date);
        return this.client.get(`/availability/${packageId}?${params.toString()}`);
      },
      () => dummyData.checkAvailability(packageId, travelers, date),
      'checkAvailability'
    );
  }

  /**
   * Get featured packages
   */
  async getFeaturedPackages(limit = 5) {
    return this.withFallback(
      () => this.client.get(`/featured?limit=${limit}`),
      () => dummyData.getFeaturedPackages(limit),
      'getFeaturedPackages'
    );
  }

  /**
   * Get trip types
   */
  async getTripTypes() {
    return this.withFallback(
      () => this.client.get('/trip-types'),
      () => dummyData.getTripTypes(),
      'getTripTypes'
    );
  }

  /**
   * Search destinations by query
   */
  async searchDestinations(query) {
    return this.withFallback(
      () => this.client.get(`/search/destinations?q=${encodeURIComponent(query)}`),
      () => dummyData.searchDestinations(query),
      'searchDestinations'
    );
  }

  /**
   * Get quick suggestions based on context
   */
  getQuickSuggestions(step) {
    return dummyData.getQuickSuggestions(step);
  }

  /**
   * Check if CRM is currently available
   */
  isCRMAvailable() {
    return this.crmAvailable;
  }
}

module.exports = new CRMClient();
