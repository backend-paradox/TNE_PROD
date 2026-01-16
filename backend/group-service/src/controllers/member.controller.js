const memberService = require('../services/member.service');
const ApiResponse = require('../utils/ApiResponse');

const getMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const members = await memberService.getGroupMembers(req.params.groupId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return ApiResponse.success(res, members);
  } catch (error) {
    next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const invitation = await memberService.inviteMember(
      req.params.groupId,
      req.user.id,
      req.body
    );
    return ApiResponse.created(res, invitation, 'Invitation sent');
  } catch (error) {
    next(error);
  }
};

const getInvitations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const invitations = await memberService.getPendingInvitations(req.params.groupId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return ApiResponse.success(res, invitations);
  } catch (error) {
    next(error);
  }
};

const cancelInvitation = async (req, res, next) => {
  try {
    // Fix: Pass cancellerId (current user ID) for authorization check
    await memberService.cancelInvitation(req.params.invitationId, req.user.id);
    return ApiResponse.success(res, null, 'Invitation cancelled');
  } catch (error) {
    next(error);
  }
};

const acceptInvitation = async (req, res, next) => {
  try {
    const result = await memberService.acceptInvitation(req.params.token, req.user?.id);
    return ApiResponse.success(res, result, 'Invitation accepted');
  } catch (error) {
    next(error);
  }
};

const declineInvitation = async (req, res, next) => {
  try {
    await memberService.declineInvitation(req.params.token);
    return ApiResponse.success(res, null, 'Invitation declined');
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    // Fix: Pass updaterId (current user ID) for authorization check
    const result = await memberService.updateMemberRole(
      req.params.groupId,
      req.params.memberId,
      req.body.role,
      req.user.id
    );
    return ApiResponse.success(res, result, 'Member role updated');
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    await memberService.removeMember(
      req.params.groupId,
      req.params.memberId,
      req.user.id
    );
    return ApiResponse.success(res, null, 'Member removed');
  } catch (error) {
    next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    await memberService.leaveGroup(req.params.groupId, req.user.id);
    return ApiResponse.success(res, null, 'Left group');
  } catch (error) {
    next(error);
  }
};

const updateRSVP = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await memberService.updateRSVP(
      req.params.groupId,
      req.user.id,
      status
    );
    return ApiResponse.success(res, result, 'RSVP updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  inviteMember,
  getInvitations,
  cancelInvitation,
  acceptInvitation,
  declineInvitation,
  updateMemberRole,
  removeMember,
  leaveGroup,
  updateRSVP,
};
