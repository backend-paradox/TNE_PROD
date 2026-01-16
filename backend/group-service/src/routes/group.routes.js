const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const invitationController = require('../controllers/invitation.controller');
const { authenticate } = require('../middleware/auth');
const { isGroupMember, isGroupAdmin, isGroupOwner } = require('../middleware/groupAuth');
const { validate } = require('../middleware/validate');
const { createGroupSchema, updateGroupSchema } = require('../validators/group.validator');

// All routes require authentication
router.use(authenticate);

// Get travelers going to same destination
router.get('/travelers-by-destination', groupController.getTravellersByDestination);
// Get nearby public groups (planning only)
router.get('/nearby-groups', groupController.getNearbyGroups);
// Get nearby inbox conversations (direct chats with nearby travellers)
router.get('/nearby-inbox', groupController.getNearbyInbox);
// Get all public destinations
router.get('/destinations', groupController.getDestinations);

// Preview group by invite code (before joining)
router.get('/preview/:inviteCode', groupController.previewGroupByCode);

// Join group using invite code
router.post('/join', groupController.joinGroupByCode);

// Get all groups for current user
router.get('/', groupController.getMyGroups);

// Search public groups
router.get('/search', groupController.searchGroups);

// Create new group
router.post('/', validate(createGroupSchema), groupController.createGroup);

// Get single group
router.get('/:groupId', isGroupMember, groupController.getGroup);

// Update group
router.put('/:groupId', isGroupAdmin, validate(updateGroupSchema), groupController.updateGroup);

// Delete group
router.delete('/:groupId', isGroupOwner, groupController.deleteGroup);

// Join request (for public groups)
router.post('/:groupId/join', groupController.requestToJoin);

// Handle join requests (admin)
router.get('/:groupId/join-requests', isGroupAdmin, groupController.getJoinRequests);
router.put('/:groupId/join-requests/:requestId', isGroupAdmin, groupController.handleJoinRequest);

// Update group status (admin only) - Start Early / End Early
router.put('/:groupId/status', isGroupAdmin, groupController.updateGroupStatus);

// Group stats and summaries
router.get('/:groupId/stats', isGroupMember, groupController.getGroupStats);
router.get('/:groupId/expense-summary', isGroupMember, groupController.getExpenseSummary);

// ============ Invitation Routes ============

// Invite by userId (for connections)
router.post('/:groupId/invitations/user', isGroupMember, invitationController.inviteByUserId);

// Invite by email (uses /invitations endpoint)
router.post('/:groupId/invitations', isGroupMember, invitationController.inviteByEmail);

// Get pending invitations for a group (Admin only)
router.get('/:groupId/invitations', isGroupAdmin, invitationController.getGroupInvitations);

// Get user's received invitations
router.get('/invitations/my', invitationController.getUserInvitations);

// Accept invitation
router.post('/invitations/:invitationId/accept', invitationController.acceptInvitation);

// Decline invitation
router.post('/invitations/:invitationId/decline', invitationController.declineInvitation);

// Cancel invitation (by inviter or admin)
router.delete('/invitations/:invitationId', invitationController.cancelInvitation);

module.exports = router;
