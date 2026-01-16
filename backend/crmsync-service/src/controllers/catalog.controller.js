const catalogService = require('../services/catalogService');
const { ApiResponse, ApiError } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

class CatalogController {
  /**
   * GET /catalog/destinations
   * Get all active destinations
   */
  getDestinations = asyncHandler(async (req, res) => {
    const destinations = await catalogService.getDestinations();
    res.json(ApiResponse.success(destinations, 'Destinations retrieved successfully'));
  });

  /**
   * GET /catalog/destinations/:slug
   * Get destination by slug with packages
   */
  getDestinationBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const destination = await catalogService.getDestinationBySlug(slug);

    if (!destination) {
      throw ApiError.notFound(`Destination '${slug}' not found`);
    }

    res.json(ApiResponse.success(destination, 'Destination retrieved successfully'));
  });

  /**
   * GET /catalog/packages
   * Search packages with filters
   * Query params: destination, tripType, minBudget, maxBudget, travelers, featured, page, limit
   */
  searchPackages = asyncHandler(async (req, res) => {
    const filters = {
      destination: req.query.destination,
      tripType: req.query.tripType,
      minBudget: req.query.minBudget,
      maxBudget: req.query.maxBudget,
      travelers: req.query.travelers,
      featured: req.query.featured,
      page: req.query.page || 1,
      limit: req.query.limit || 10
    };

    const result = await catalogService.searchPackages(filters);
    res.json(ApiResponse.success(result, 'Packages retrieved successfully'));
  });

  /**
   * GET /catalog/packages/:packageId
   * Get package details by packageId (e.g., PKG_GOA_001)
   */
  getPackageById = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const pkg = await catalogService.getPackageById(packageId);

    if (!pkg) {
      throw ApiError.notFound(`Package '${packageId}' not found`);
    }

    res.json(ApiResponse.success(pkg, 'Package retrieved successfully'));
  });

  /**
   * GET /catalog/availability/:packageId
   * Check package availability
   * Query params: travelers, date
   */
  checkAvailability = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const { travelers = 1, date } = req.query;

    const availability = await catalogService.checkAvailability(packageId, travelers, date);
    res.json(ApiResponse.success(availability, 'Availability checked successfully'));
  });

  /**
   * GET /catalog/featured
   * Get featured packages
   * Query params: limit
   */
  getFeaturedPackages = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const packages = await catalogService.getFeaturedPackages(limit);
    res.json(ApiResponse.success(packages, 'Featured packages retrieved successfully'));
  });

  /**
   * GET /catalog/trip-types
   * Get available trip types with counts
   */
  getTripTypes = asyncHandler(async (req, res) => {
    const tripTypes = await catalogService.getTripTypes();
    res.json(ApiResponse.success(tripTypes, 'Trip types retrieved successfully'));
  });

  /**
   * GET /catalog/search/destinations
   * Search destinations by name (for autocomplete)
   * Query params: q (search query)
   */
  searchDestinations = asyncHandler(async (req, res) => {
    const query = req.query.q || '';

    if (query.length < 2) {
      return res.json(ApiResponse.success([], 'Search query too short'));
    }

    const destinations = await catalogService.searchDestinations(query);
    res.json(ApiResponse.success(destinations, 'Destinations found'));
  });
}

module.exports = new CatalogController();
