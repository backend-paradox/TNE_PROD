const invitationService = require('../services/invitation.service');
const ApiResponse = require('../utils/ApiResponse');

const inviteByUserId = async (req, res, next) => {
  try {
    const { userId, message } = req.body;
    const invitation = await invitationService.inviteByUserId(
      req.params.groupId,
      req.user.id,
      userId,
      message
    );
    return ApiResponse.created(res, invitation, 'Invitation sent');
  } catch (error) {
    next(error);
  }
};

const inviteByEmail = async (req, res, next) => {
  try {
    const { email, message } = req.body;
    const invitation = await invitationService.inviteByEmail(
      req.params.groupId,
      req.user.id,
      email,
      message
    );
    return ApiResponse.created(res, invitation, 'Invitation sent');
  } catch (error) {
    next(error);
  }
};

const getGroupInvitations = async (req, res, next) => {
  try {
    const invitations = await invitationService.getGroupInvitations(
      req.params.groupId,
      req.user.id
    );
    return ApiResponse.success(res, invitations);
  } catch (error) {
    next(error);
  }
};

const getUserInvitations = async (req, res, next) => {
  try {
    const invitations = await invitationService.getUserInvitations(req.user.id);
    return ApiResponse.success(res, invitations);
  } catch (error) {
    next(error);
  }
};

const acceptInvitation = async (req, res, next) => {
  try {
    const result = await invitationService.acceptInvitation(
      req.params.invitationId,
      req.user.id
    );
    return ApiResponse.success(res, result, 'Invitation accepted');
  } catch (error) {
    next(error);
  }
};

const declineInvitation = async (req, res, next) => {
  try {
    const result = await invitationService.declineInvitation(
      req.params.invitationId,
      req.user.id
    );
    return ApiResponse.success(res, result, 'Invitation declined');
  } catch (error) {
    next(error);
  }
};

const cancelInvitation = async (req, res, next) => {
  try {
    const result = await invitationService.cancelInvitation(
      req.params.invitationId,
      req.user.id
    );
    return ApiResponse.success(res, result, 'Invitation cancelled');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  inviteByUserId,
  inviteByEmail,
  getGroupInvitations,
  getUserInvitations,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
};
