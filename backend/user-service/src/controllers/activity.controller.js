const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get user's activity feed (own activities + connections' activities)
 * @route   GET /api/v1/users/activity-feed
 * @access  Private
 */
const getActivityFeed = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { page = 1, limit = 20, type } = req.query;

  const result = await userService.getActivityFeed(authId, {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
  });

  res.status(200).json(
    ApiResponse.success(result, 'Activity feed retrieved successfully')
  );
});

/**
 * @desc    Get user's own activities
 * @route   GET /api/v1/users/activities
 * @access  Private
 */
const getMyActivities = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { page = 1, limit = 20, type } = req.query;

  const result = await userService.getUserActivities(authId, null, {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
  });

  res.status(200).json(
    ApiResponse.success(result, 'Activities retrieved successfully')
  );
});

/**
 * @desc    Get specific user's public activities
 * @route   GET /api/v1/users/:userId/activities
 * @access  Private
 */
const getUserActivities = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const targetUserId = parseInt(req.params.userId);
  const { page = 1, limit = 20, type } = req.query;

  const result = await userService.getUserActivities(authId, targetUserId, {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
  });

  res.status(200).json(
    ApiResponse.success(result, 'User activities retrieved successfully')
  );
});

/**
 * @desc    Create an activity (internal use, also exposed for testing)
 * @route   POST /api/v1/users/activities
 * @access  Private
 */
const createActivity = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { type, title, description, metadata, referenceType, referenceId, isPublic } = req.body;

  const activity = await userService.createActivity(authId, {
    type,
    title,
    description,
    metadata,
    referenceType,
    referenceId,
    isPublic,
  });

  res.status(201).json(
    ApiResponse.success(activity, 'Activity created successfully')
  );
});

/**
 * @desc    Get user stats (trips, reviews, connections)
 * @route   GET /api/v1/users/stats
 * @access  Private
 */
const getMyStats = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const stats = await userService.getUserStats(authId);

  res.status(200).json(
    ApiResponse.success(stats, 'User stats retrieved successfully')
  );
});

/**
 * @desc    Get specific user's public stats
 * @route   GET /api/v1/users/:userId/stats
 * @access  Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const targetUserId = parseInt(req.params.userId);

  const stats = await userService.getUserStatsById(targetUserId);

  res.status(200).json(
    ApiResponse.success(stats, 'User stats retrieved successfully')
  );
});

/**
 * @desc    Calculate compatibility score with another user
 * @route   GET /api/v1/users/:userId/compatibility
 * @access  Private
 */
const getCompatibility = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const targetUserId = parseInt(req.params.userId);

  const compatibility = await userService.calculateCompatibility(authId, targetUserId);

  res.status(200).json(
    ApiResponse.success(compatibility, 'Compatibility calculated successfully')
  );
});

/**
 * @desc    Get public profile of a user
 * @route   GET /api/v1/users/:userId/public-profile
 * @access  Private
 */
const getPublicProfile = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const targetUserId = parseInt(req.params.userId);

  const profile = await userService.getPublicProfile(authId, targetUserId);

  res.status(200).json(
    ApiResponse.success(profile, 'Public profile retrieved successfully')
  );
});

module.exports = {
  getActivityFeed,
  getMyActivities,
  getUserActivities,
  createActivity,
  getMyStats,
  getUserStats,
  getCompatibility,
  getPublicProfile,
};
