const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Send connection request
 * @route   POST /api/v1/users/connections/request
 * @access  Private
 */
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { userId, message } = req.body;

  const connection = await userService.sendConnectionRequest(authId, parseInt(userId), message);

  res.status(201).json(
    ApiResponse.success(connection, 'Connection request sent successfully')
  );
});

/**
 * @desc    Accept connection request
 * @route   POST /api/v1/users/connections/:connectionId/accept
 * @access  Private
 */
const acceptConnection = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const connectionId = parseInt(req.params.connectionId);

  const connection = await userService.acceptConnection(authId, connectionId);

  res.status(200).json(
    ApiResponse.success(connection, 'Connection request accepted')
  );
});

/**
 * @desc    Reject connection request
 * @route   POST /api/v1/users/connections/:connectionId/reject
 * @access  Private
 */
const rejectConnection = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const connectionId = parseInt(req.params.connectionId);

  await userService.rejectConnection(authId, connectionId);

  res.status(200).json(
    ApiResponse.success(null, 'Connection request rejected')
  );
});

/**
 * @desc    Remove connection (unfriend)
 * @route   DELETE /api/v1/users/connections/:userId
 * @access  Private
 */
const removeConnection = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const userId = parseInt(req.params.userId);

  await userService.removeConnection(authId, userId);

  res.status(200).json(
    ApiResponse.success(null, 'Connection removed successfully')
  );
});

/**
 * @desc    Get all connections (friends)
 * @route   GET /api/v1/users/connections
 * @access  Private
 */
const getConnections = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const result = await userService.getConnections(authId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json(
    ApiResponse.success(result, 'Connections retrieved successfully')
  );
});

/**
 * @desc    Get pending connection requests (received)
 * @route   GET /api/v1/users/connections/pending
 * @access  Private
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const result = await userService.getPendingRequests(authId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json(
    ApiResponse.success(result, 'Pending requests retrieved successfully')
  );
});

/**
 * @desc    Get sent connection requests
 * @route   GET /api/v1/users/connections/sent
 * @access  Private
 */
const getSentRequests = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const result = await userService.getSentRequests(authId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json(
    ApiResponse.success(result, 'Sent requests retrieved successfully')
  );
});

/**
 * @desc    Get connection status with a specific user
 * @route   GET /api/v1/users/connections/:userId/status
 * @access  Private
 */
const getConnectionStatus = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const userId = parseInt(req.params.userId);

  const status = await userService.getConnectionStatus(authId, userId);

  res.status(200).json(
    ApiResponse.success(status, 'Connection status retrieved')
  );
});

/**
 * @desc    Cancel sent connection request
 * @route   DELETE /api/v1/users/connections/request/:connectionId
 * @access  Private
 */
const cancelRequest = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const connectionId = parseInt(req.params.connectionId);

  await userService.cancelConnectionRequest(authId, connectionId);

  res.status(200).json(
    ApiResponse.success(null, 'Connection request cancelled')
  );
});

/**
 * @desc    Get mutual connections with a user
 * @route   GET /api/v1/users/connections/:userId/mutual
 * @access  Private
 */
const getMutualConnections = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const userId = parseInt(req.params.userId);
  const { page = 1, limit = 10 } = req.query;

  const result = await userService.getMutualConnections(authId, userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.status(200).json(
    ApiResponse.success(result, 'Mutual connections retrieved')
  );
});

/**
 * @desc    Get suggested connections based on interests/travel style
 * @route   GET /api/v1/users/connections/suggestions
 * @access  Private
 */
const getSuggestedConnections = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { limit = 10 } = req.query;

  const suggestions = await userService.getSuggestedConnections(authId, parseInt(limit));

  res.status(200).json(
    ApiResponse.success(suggestions, 'Suggestions retrieved successfully')
  );
});

module.exports = {
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  removeConnection,
  getConnections,
  getPendingRequests,
  getSentRequests,
  getConnectionStatus,
  cancelRequest,
  getMutualConnections,
  getSuggestedConnections,
};
