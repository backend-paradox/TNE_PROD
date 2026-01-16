const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const { authenticate } = require('../middleware/auth');
const { isGroupMember, isGroupAdmin, isGroupOwner } = require('../middleware/groupAuth');
const { validate } = require('../middleware/validate');
const { updateMemberSchema } = require('../validators/member.validator');

// All routes require authentication
router.use(authenticate);

// Get group members
router.get('/:groupId/members', isGroupMember, memberController.getMembers);

// Accept/decline invitation (via token - no auth required for email invites)
router.post('/invitations/:token/accept', memberController.acceptInvitation);
router.post('/invitations/:token/decline', memberController.declineInvitation);

// Update member role
router.put('/:groupId/members/:memberId', isGroupOwner, validate(updateMemberSchema), memberController.updateMemberRole);

// Remove member
router.delete('/:groupId/members/:memberId', isGroupAdmin, memberController.removeMember);

// Leave group
router.post('/:groupId/leave', isGroupMember, memberController.leaveGroup);

// Update RSVP status
router.put('/:groupId/rsvp', isGroupMember, memberController.updateRSVP);

module.exports = router;
