const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');

// All catalog routes are PUBLIC (no authentication required)
// These endpoints are used by the chatbot to fetch travel data

/**
 * @route   GET /api/v1/crmsync/catalog/destinations
 * @desc    Get all active destinations
 * @access  Public
 */
router.get('/destinations', catalogController.getDestinations);

/**
 * @route   GET /api/v1/crmsync/catalog/destinations/:slug
 * @desc    Get destination by slug with packages
 * @access  Public
 */
router.get('/destinations/:slug', catalogController.getDestinationBySlug);

/**
 * @route   GET /api/v1/crmsync/catalog/packages
 * @desc    Search packages with filters
 * @query   destination, tripType, minBudget, maxBudget, travelers, featured, page, limit
 * @access  Public
 */
router.get('/packages', catalogController.searchPackages);

/**
 * @route   GET /api/v1/crmsync/catalog/packages/:packageId
 * @desc    Get package details by packageId (e.g., PKG_GOA_001)
 * @access  Public
 */
router.get('/packages/:packageId', catalogController.getPackageById);

/**
 * @route   GET /api/v1/crmsync/catalog/availability/:packageId
 * @desc    Check package availability
 * @query   travelers, date
 * @access  Public
 */
router.get('/availability/:packageId', catalogController.checkAvailability);

/**
 * @route   GET /api/v1/crmsync/catalog/featured
 * @desc    Get featured packages
 * @query   limit
 * @access  Public
 */
router.get('/featured', catalogController.getFeaturedPackages);

/**
 * @route   GET /api/v1/crmsync/catalog/trip-types
 * @desc    Get available trip types with counts
 * @access  Public
 */
router.get('/trip-types', catalogController.getTripTypes);

/**
 * @route   GET /api/v1/crmsync/catalog/search/destinations
 * @desc    Search destinations by name (for autocomplete)
 * @query   q (search query)
 * @access  Public
 */
router.get('/search/destinations', catalogController.searchDestinations);

module.exports = router;
