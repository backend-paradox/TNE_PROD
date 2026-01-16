const groupService = require('../services/group.service');
const ApiResponse = require('../utils/ApiResponse');

const getMyGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await groupService.getUserGroups(
      req.user.id,
      parseInt(page),
      parseInt(limit),
      status // Pass status filter (PLANNING, ON_TOUR, COMPLETED)
    );
    return ApiResponse.paginated(res, result.groups, result.pagination);
  } catch (error) {
    next(error);
  }
};

const searchGroups = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20, destination, startDate, endDate } = req.query;
    const result = await groupService.searchPublicGroups(q, {
      page: parseInt(page),
      limit: parseInt(limit),
      destination,
      startDate,
      endDate,
    });
    return ApiResponse.paginated(res, result.groups, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const group = await groupService.getGroupById(req.params.groupId, req.user.id);
    return ApiResponse.success(res, group);
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup(req.user.id, req.body);
    return ApiResponse.created(res, group);
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const group = await groupService.updateGroup(
      req.params.groupId,
      req.user.id,
      req.body
    );
    return ApiResponse.success(res, group, 'Group updated');
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    await groupService.deleteGroup(req.params.groupId, req.user.id);
    return ApiResponse.success(res, null, 'Group deleted');
  } catch (error) {
    next(error);
  }
};

const requestToJoin = async (req, res, next) => {
  try {
    const { message } = req.body;
    const result = await groupService.requestToJoin(
      req.params.groupId,
      req.user.id,
      message
    );
    const responseMessage = result?.rejoined ? 'Rejoined group' : 'Join request sent';
    return ApiResponse.created(res, result, responseMessage);
  } catch (error) {
    next(error);
  }
};

const getJoinRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await groupService.getJoinRequests(req.params.groupId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return ApiResponse.paginated(res, result.requests, result.pagination);
  } catch (error) {
    next(error);
  }
};

const handleJoinRequest = async (req, res, next) => {
  try {
    const { action, reason } = req.body; // 'approve' or 'reject'
    const result = await groupService.handleJoinRequest(
      req.params.requestId,
      req.user.id,
      action,
      reason
    );
    return ApiResponse.success(res, result, `Request ${action}d`);
  } catch (error) {
    next(error);
  }
};

const getGroupStats = async (req, res, next) => {
  try {
    const stats = await groupService.getGroupStats(req.params.groupId);
    return ApiResponse.success(res, stats);
  } catch (error) {
    next(error);
  }
};

const getExpenseSummary = async (req, res, next) => {
  try {
    const summary = await groupService.getExpenseSummary(req.params.groupId);
    return ApiResponse.success(res, summary);
  } catch (error) {
    next(error);
  }
};

const previewGroupByCode = async (req, res, next) => {
  try {
    const preview = await groupService.previewGroupByCode(req.params.inviteCode);
    return ApiResponse.success(res, preview);
  } catch (error) {
    next(error);
  }
};

const joinGroupByCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const result = await groupService.joinGroupByCode(inviteCode, req.user.id);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

const getTravellersByDestination = async (req, res, next) => {
  try {
    const { destination, status, manual, startDate, endDate, feed } = req.query;
    const isManual = manual === 'true' || manual === '1';
    const isFeed = feed === 'true' || feed === '1';
    const result = await groupService.getTravellersNearby(
      req.user.id,
      destination,
      status,
      isManual,
      startDate,
      endDate,
      isFeed
    );
    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

const getNearbyGroups = async (req, res, next) => {
  try {
    const { destination, startDate, endDate, feed } = req.query;
    const isFeed = feed === 'true' || feed === '1';
    const result = await groupService.getNearbyGroups(
      req.user.id,
      destination,
      startDate,
      endDate,
      isFeed
    );
    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

const getNearbyInbox = async (req, res, next) => {
  try {
    const { destination, startDate, endDate } = req.query;
    const result = await groupService.getNearbyInbox(
      req.user.id,
      req.headers.authorization,
      destination,
      startDate,
      endDate
    );
    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

const getDestinations = async (req, res, next) => {
  try {
    const result = await groupService.getGroupDestinations();
    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

const updateGroupStatus = async (req, res, next) => {
  try {
    const { action } = req.body; // 'START_EARLY' | 'END_EARLY' | 'RESET_DATES' | 'EXTEND_TRIP'
    const result = await groupService.updateGroupStatus(
      req.params.groupId,
      req.user.id,
      action,
      req.body
    );
    return ApiResponse.success(res, result, `Group status updated: ${action}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyGroups,
  searchGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  requestToJoin,
  getJoinRequests,
  handleJoinRequest,
  getGroupStats,
  getExpenseSummary,
  previewGroupByCode,
  joinGroupByCode,
  getTravellersByDestination,
  getNearbyGroups,
  getNearbyInbox,
  getDestinations,
  updateGroupStatus,
};
