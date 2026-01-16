const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get all blocked users
 * @route   GET /api/v1/users/blocked
 * @access  Private
 */
const getBlockedUsers = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const blockedUsers = await userService.getBlockedUsers(authId);

  res.status(200).json(
    ApiResponse.success(blockedUsers, 'Blocked users retrieved successfully')
  );
});

/**
 * @desc    Block a user
 * @route   POST /api/v1/users/block
 * @access  Private
 */
const blockUser = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { blockedUserId, reason } = req.body;

  const block = await userService.blockUser(authId, blockedUserId, reason);

  res.status(201).json(
    ApiResponse.success(block, 'User blocked successfully')
  );
});

/**
 * @desc    Unblock a user
 * @route   DELETE /api/v1/users/block/:userId
 * @access  Private
 */
const unblockUser = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const blockedUserId = parseInt(req.params.userId);

  await userService.unblockUser(authId, blockedUserId);

  res.status(200).json(
    ApiResponse.success(null, 'User unblocked successfully')
  );
});

/**
 * @desc    Check if user is blocked
 * @route   GET /api/v1/users/block/:userId/status
 * @access  Private
 */
const checkBlockStatus = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const targetUserId = parseInt(req.params.userId);

  const isBlocked = await userService.isUserBlocked(authId, targetUserId);

  res.status(200).json(
    ApiResponse.success({ isBlocked }, 'Block status retrieved successfully')
  );
});

module.exports = {
  getBlockedUsers,
  blockUser,
  unblockUser,
  checkBlockStatus,
};
