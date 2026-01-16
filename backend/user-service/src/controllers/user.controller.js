const userService = require('../services/userService');
const uploadService = require('../services/uploadService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

// Helper to safely parse integers with validation
const safeParseInt = (value, defaultValue, min = 1, max = 100) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min) return defaultValue;
  if (parsed > max) return max;
  return parsed;
};

// Helper to safely parse floats
const safeParseFloat = (value, defaultValue, min = 0, max = 5) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < min) return defaultValue;
  if (parsed > max) return max;
  return parsed;
};

// List of allowed internal service identifiers
const ALLOWED_INTERNAL_SERVICES = ['auth-service', 'group-service'];

/**
 * @desc    Create user profile (called by auth-service after registration)
 * @route   POST /api/v1/users/profile
 * @access  Internal service call only
 */
const createProfile = asyncHandler(async (req, res) => {
  // SECURITY: Verify this is an internal service call
  const internalService = req.headers['x-internal-service'];

  // In production, require internal service header
  if (process.env.NODE_ENV === 'production') {
    if (!internalService || !ALLOWED_INTERNAL_SERVICES.includes(internalService)) {
      throw ApiError.forbidden('This endpoint is for internal service use only');
    }
  }

  const { authId, name, email, phone } = req.body;

  // Validate required fields
  if (!authId) {
    throw ApiError.badRequest('authId is required');
  }
  if (!email) {
    throw ApiError.badRequest('email is required');
  }

  // Check if profile already exists
  const existingProfile = await userService.getProfileByAuthId(authId);
  if (existingProfile) {
    return res.status(200).json(
      ApiResponse.success(existingProfile, 'Profile already exists')
    );
  }

  const profile = await userService.createProfile({ authId, name, email, phone });

  res.status(201).json(ApiResponse.success(profile, 'Profile created successfully'));
});

/**
 * @desc    Get own profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const profile = await userService.getProfileByAuthId(authId);
  if (!profile) {
    throw ApiError.notFound('Profile not found');
  }

  res.status(200).json(ApiResponse.success(profile, 'Profile retrieved successfully'));
});

/**
 * @desc    Update own profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const updateData = req.body;

  const profile = await userService.updateProfile(authId, updateData);

  res.status(200).json(ApiResponse.success(profile, 'Profile updated successfully'));
});

/**
 * @desc    Get user profile by email (internal service use)
 * @route   GET /api/v1/users/by-email/:email
 * @access  Internal service call only (production)
 */
const getProfileByEmail = asyncHandler(async (req, res) => {
  const internalService = req.headers['x-internal-service'];

  if (process.env.NODE_ENV === 'production') {
    if (!internalService || !ALLOWED_INTERNAL_SERVICES.includes(internalService)) {
      throw ApiError.forbidden('This endpoint is for internal service use only');
    }
  }

  const email = req.params.email;
  if (!email) {
    throw ApiError.badRequest('email is required');
  }

  const profile = await userService.getProfileByEmail(email);
  if (!profile) {
    throw ApiError.notFound('Profile not found');
  }

  res.status(200).json(ApiResponse.success(profile, 'Profile retrieved successfully'));
});

/**
 * @desc    Get interest suggestions from user profiles
 * @route   GET /api/v1/users/interests/suggestions
 * @access  Private
 */
const getInterestSuggestions = asyncHandler(async (req, res) => {
  const { q = '', limit = 10 } = req.query;
  const parsedLimit = safeParseInt(limit, 10, 1, 50);
  const suggestions = await userService.getInterestSuggestions(q, parsedLimit);

  res.status(200).json(
    ApiResponse.success({ suggestions }, 'Interest suggestions retrieved successfully')
  );
});

/**
 * @desc    Upload/Update profile avatar
 * @route   PUT /api/v1/users/profile/avatar
 * @access  Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  if (!req.file) {
    throw ApiError.badRequest('No image file provided. Please upload an image.');
  }

  // Get current profile to check for existing avatar
  const currentProfile = await userService.getProfileByAuthId(authId);
  if (!currentProfile) {
    throw ApiError.notFound('Profile not found');
  }

  // Upload the new avatar
  const uploadResult = await uploadService.uploadAvatar(
    req.file,
    authId,
    currentProfile.profilePicUrl
  );

  // Update profile with new avatar URL
  const profile = await userService.updateProfile(authId, {
    profilePicUrl: uploadResult.url,
  });

  res.status(200).json(
    ApiResponse.success(
      {
        profilePicUrl: profile.profilePicUrl,
        upload: {
          fileName: uploadResult.fileName,
          size: uploadResult.size,
          storage: uploadResult.storage,
        },
      },
      'Avatar uploaded successfully'
    )
  );
});

/**
 * @desc    Delete profile avatar
 * @route   DELETE /api/v1/users/profile/avatar
 * @access  Private
 */
const deleteAvatar = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  // Get current profile
  const currentProfile = await userService.getProfileByAuthId(authId);
  if (!currentProfile) {
    throw ApiError.notFound('Profile not found');
  }

  if (!currentProfile.profilePicUrl) {
    throw ApiError.badRequest('No avatar to delete');
  }

  // Delete the avatar file
  await uploadService.deleteAvatar(currentProfile.profilePicUrl);

  // Update profile to remove avatar URL
  await userService.updateProfile(authId, { profilePicUrl: null });

  res.status(200).json(ApiResponse.success(null, 'Avatar deleted successfully'));
});

/**
 * @desc    Soft delete own profile
 * @route   DELETE /api/v1/users/profile
 * @access  Private
 */
const deleteProfile = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  await userService.deleteProfile(authId);

  res.status(200).json(ApiResponse.success(null, 'Profile deleted successfully'));
});

/**
 * @desc    Get all user profiles (admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getAllProfiles = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;

  const result = await userService.getAllProfiles({
    page: safeParseInt(page, 1, 1, 1000),
    limit: safeParseInt(limit, 20, 1, 100),
    search,
  });

  res.status(200).json(
    ApiResponse.success(result, 'User profiles retrieved successfully')
  );
});

/**
 * @desc    Get user profile by ID (admin only)
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
const getProfileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userId = safeParseInt(id, null, 1, Number.MAX_SAFE_INTEGER);
  if (userId === null) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const profile = await userService.getProfileById(userId);
  if (!profile) {
    throw ApiError.notFound('Profile not found');
  }

  res.status(200).json(ApiResponse.success(profile, 'Profile retrieved successfully'));
});

/**
 * @desc    Search users
 * @route   GET /api/v1/users/search
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, travelStyle, verified, minRating } = req.query;

  const result = await userService.searchUsers({
    page: safeParseInt(page, 1, 1, 1000),
    limit: safeParseInt(limit, 20, 1, 100),
    search,
    travelStyle,
    verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
    minRating: minRating ? safeParseFloat(minRating, undefined, 0, 5) : undefined,
  });

  res.status(200).json(
    ApiResponse.success(result, 'Users search results retrieved successfully')
  );
});

/**
 * @desc    Verify a user (admin only)
 * @route   POST /api/v1/users/:id/verify
 * @access  Private/Admin
 */
const verifyUser = asyncHandler(async (req, res) => {
  const userId = safeParseInt(req.params.id, null, 1, Number.MAX_SAFE_INTEGER);
  if (userId === null) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const user = await userService.verifyUser(userId);

  res.status(200).json(
    ApiResponse.success(user, 'User verified successfully')
  );
});

/**
 * @desc    Unverify a user (admin only)
 * @route   POST /api/v1/users/:id/unverify
 * @access  Private/Admin
 */
const unverifyUser = asyncHandler(async (req, res) => {
  const userId = safeParseInt(req.params.id, null, 1, Number.MAX_SAFE_INTEGER);
  if (userId === null) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const user = await userService.unverifyUser(userId);

  res.status(200).json(
    ApiResponse.success(user, 'User unverified successfully')
  );
});

/**
 * @desc    Update user stats (internal/admin)
 * @route   PUT /api/v1/users/:id/stats
 * @access  Private/Admin
 */
const updateUserStats = asyncHandler(async (req, res) => {
  const userId = safeParseInt(req.params.id, null, 1, Number.MAX_SAFE_INTEGER);
  if (userId === null) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const { totalTrips, rating, totalReviews } = req.body;

  // Validate numeric fields if provided
  const stats = {};
  if (totalTrips !== undefined) {
    stats.totalTrips = safeParseInt(totalTrips, 0, 0, Number.MAX_SAFE_INTEGER);
  }
  if (rating !== undefined) {
    stats.rating = safeParseFloat(rating, 0, 0, 5);
  }
  if (totalReviews !== undefined) {
    stats.totalReviews = safeParseInt(totalReviews, 0, 0, Number.MAX_SAFE_INTEGER);
  }

  const user = await userService.updateUserStats(userId, stats);

  res.status(200).json(
    ApiResponse.success(user, 'User stats updated successfully')
  );
});

// ==================== Location & Nearby Travellers ====================

/**
 * @desc    Update current location
 * @route   PUT /api/v1/users/location
 * @access  Private
 */
const updateLocation = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { latitude, longitude, locationName } = req.body;

  const location = await userService.updateLocation(authId, {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    locationName,
  });

  res.status(200).json(
    ApiResponse.success(location, 'Location updated successfully')
  );
});

/**
 * @desc    Get nearby travellers
 * @route   GET /api/v1/users/nearby
 * @access  Private
 */
const getNearbyTravellers = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { radius, page, limit } = req.query;

  const result = await userService.getNearbyTravellers(authId, {
    radiusKm: safeParseInt(radius, 50, 1, 500),
    page: safeParseInt(page, 1, 1, 1000),
    limit: safeParseInt(limit, 20, 1, 100),
  });

  res.status(200).json(
    ApiResponse.success(result, 'Nearby travellers retrieved successfully')
  );
});

/**
 * @desc    Update user social vibe score (internal/admin)
 * @route   PUT /api/v1/users/:id/vibe-score
 * @access  Private/Admin
 */
const updateVibeScore = asyncHandler(async (req, res) => {
  const userId = safeParseInt(req.params.id, null, 1, Number.MAX_SAFE_INTEGER);
  if (userId === null) {
    throw ApiError.badRequest('Invalid user ID');
  }

  const { score } = req.body;
  if (score === undefined) {
    throw ApiError.badRequest('Score is required');
  }

  const user = await userService.updateSocialVibeScore(
    userId,
    safeParseFloat(score, 0, 0, 100)
  );

  res.status(200).json(
    ApiResponse.success(user, 'Social vibe score updated successfully')
  );
});

/**
 * @desc    Get user profiles in batch (for internal service calls)
 * @route   POST /api/v1/users/profiles/batch
 * @access  Internal service only
 */
const getUserProfilesBatch = asyncHandler(async (req, res) => {
  // SECURITY: Verify this is an internal service call
  const internalService = req.headers['x-internal-service'];

  if (!internalService) {
    throw ApiError.forbidden('This endpoint is for internal service use only');
  }

  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw ApiError.badRequest('userIds array is required');
  }

  const profiles = await userService.getUserProfilesBatch(userIds);

  res.status(200).json(ApiResponse.success(profiles, 'Profiles retrieved successfully'));
});

/**
 * @desc    Get connection statuses in batch (for internal service calls)
 * @route   POST /api/v1/users/connections/status/batch
 * @access  Internal service only (requires X-User-Auth-Id header)
 */
const getConnectionStatusesBatch = asyncHandler(async (req, res) => {
  // SECURITY: Verify this is an internal service call
  const internalService = req.headers['x-internal-service'];
  const currentUserId = req.headers['x-user-auth-id'];

  if (!internalService) {
    throw ApiError.forbidden('This endpoint is for internal service use only');
  }

  if (!currentUserId) {
    throw ApiError.badRequest('X-User-Auth-Id header is required');
  }

  const { targetUserIds } = req.body;

  if (!targetUserIds || !Array.isArray(targetUserIds) || targetUserIds.length === 0) {
    throw ApiError.badRequest('targetUserIds array is required');
  }

  const statusMap = await userService.getConnectionStatusesBatch(
    parseInt(currentUserId),
    targetUserIds
  );

  res.status(200).json(ApiResponse.success(statusMap, 'Connection statuses retrieved successfully'));
});

module.exports = {
  createProfile,
  getProfile,
  getProfileByEmail,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  deleteProfile,
  getAllProfiles,
  getProfileById,
  searchUsers,
  verifyUser,
  unverifyUser,
  updateUserStats,
  updateLocation,
  getNearbyTravellers,
  updateVibeScore,
  getInterestSuggestions,
  getUserProfilesBatch,
  getConnectionStatusesBatch,
};
