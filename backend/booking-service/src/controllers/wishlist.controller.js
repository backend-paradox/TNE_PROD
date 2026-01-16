const wishlistService = require('../services/wishlistService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const wishlist = await wishlistService.getWishlist(userId);

  res.status(200).json(
    ApiResponse.success(wishlist, 'Wishlist retrieved successfully')
  );
});

/**
 * @desc    Get wishlist IDs only (for quick lookup)
 * @route   GET /api/v1/wishlist/ids
 * @access  Private
 */
const getWishlistIds = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const ids = await wishlistService.getWishlistIds(userId);

  res.status(200).json(
    ApiResponse.success(ids, 'Wishlist IDs retrieved')
  );
});

/**
 * @desc    Check if item is in wishlist
 * @route   GET /api/v1/wishlist/check/:packageId
 * @access  Private
 */
const checkWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { packageId } = req.params;
  const { type = 'tour' } = req.query;

  const isInWishlist = await wishlistService.isInWishlist(userId, packageId, type);

  res.status(200).json(
    ApiResponse.success({ isInWishlist }, 'Wishlist status checked')
  );
});

/**
 * @desc    Add item to wishlist
 * @route   POST /api/v1/wishlist
 * @access  Private
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { packageId, type, name, slug, image, price, duration, destination } = req.body;

  if (!packageId || !type || !name || !slug) {
    throw ApiError.badRequest('Missing required fields: packageId, type, name, slug');
  }

  const item = await wishlistService.addToWishlist(userId, {
    packageId,
    type,
    name,
    slug,
    image,
    price,
    duration,
    destination,
  });

  res.status(201).json(
    ApiResponse.success(item, 'Item added to wishlist')
  );
});

/**
 * @desc    Toggle wishlist item (add/remove)
 * @route   POST /api/v1/wishlist/toggle
 * @access  Private
 */
const toggleWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { packageId, type, name, slug, image, price, duration, destination } = req.body;

  if (!packageId || !type) {
    throw ApiError.badRequest('Missing required fields: packageId, type');
  }

  const result = await wishlistService.toggleWishlist(userId, {
    packageId,
    type,
    name,
    slug,
    image,
    price,
    duration,
    destination,
  });

  const message = result.action === 'added' ? 'Item added to wishlist' : 'Item removed from wishlist';

  res.status(200).json(
    ApiResponse.success(result, message)
  );
});

/**
 * @desc    Remove item from wishlist
 * @route   DELETE /api/v1/wishlist/:packageId
 * @access  Private
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { packageId } = req.params;
  const { type = 'tour' } = req.query;

  await wishlistService.removeFromWishlist(userId, packageId, type);

  res.status(200).json(
    ApiResponse.success(null, 'Item removed from wishlist')
  );
});

/**
 * @desc    Clear entire wishlist
 * @route   DELETE /api/v1/wishlist
 * @access  Private
 */
const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await wishlistService.clearWishlist(userId);

  res.status(200).json(
    ApiResponse.success(null, 'Wishlist cleared')
  );
});

module.exports = {
  getWishlist,
  getWishlistIds,
  checkWishlist,
  addToWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
};
