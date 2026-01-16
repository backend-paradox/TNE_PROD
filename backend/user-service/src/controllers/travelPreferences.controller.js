const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get travel preferences
 * @route   GET /api/v1/users/travel-preferences
 * @access  Private
 */
const getTravelPreferences = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const preferences = await userService.getTravelPreferences(authId);

  res.status(200).json(
    ApiResponse.success(preferences, 'Travel preferences retrieved successfully')
  );
});

/**
 * @desc    Create or update travel preferences
 * @route   PUT /api/v1/users/travel-preferences
 * @access  Private
 */
const upsertTravelPreferences = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const preferencesData = req.body;

  const preferences = await userService.upsertTravelPreferences(authId, preferencesData);

  res.status(200).json(
    ApiResponse.success(preferences, 'Travel preferences updated successfully')
  );
});

/**
 * @desc    Delete travel preferences
 * @route   DELETE /api/v1/users/travel-preferences
 * @access  Private
 */
const deleteTravelPreferences = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  await userService.deleteTravelPreferences(authId);

  res.status(200).json(
    ApiResponse.success(null, 'Travel preferences deleted successfully')
  );
});

module.exports = {
  getTravelPreferences,
  upsertTravelPreferences,
  deleteTravelPreferences,
};
