const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');
const { authenticate } = require('../middleware/auth');
const { isGroupMember, isGroupAdmin } = require('../middleware/groupAuth');
const { validate } = require('../middleware/validate');
const { createPollSchema } = require('../validators/poll.validator');

// All routes require authentication
router.use(authenticate);

// Get all polls for a group
router.get('/:groupId/polls', isGroupMember, pollController.getPolls);

// Get single poll with results
router.get('/:groupId/polls/:pollId', isGroupMember, pollController.getPoll);

// Create poll
router.post('/:groupId/polls', isGroupMember, validate(createPollSchema), pollController.createPoll);

// Vote on poll
router.post('/:groupId/polls/:pollId/vote', isGroupMember, pollController.vote);

// Add/remove poll options (group members)
router.post('/:groupId/polls/:pollId/options', isGroupMember, pollController.addOption);
router.delete('/:groupId/polls/:pollId/options/:optionId', isGroupMember, pollController.removeOption);

// Close poll (creator or admin)
router.put('/:groupId/polls/:pollId/close', isGroupMember, pollController.closePoll);

// Delete poll (creator or admin)
router.delete('/:groupId/polls/:pollId', isGroupAdmin, pollController.deletePoll);

module.exports = router;
