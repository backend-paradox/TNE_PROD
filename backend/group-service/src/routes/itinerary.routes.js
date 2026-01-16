const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itinerary.controller');
const { authenticate } = require('../middleware/auth');
const { isGroupMember, isGroupAdmin } = require('../middleware/groupAuth');
const { validate } = require('../middleware/validate');
const { createItinerarySchema, updateItinerarySchema } = require('../validators/itinerary.validator');

// All routes require authentication
router.use(authenticate);

// Get itinerary for a group
router.get('/:groupId/itinerary', isGroupMember, itineraryController.getItinerary);

// Add itinerary item
router.post('/:groupId/itinerary', isGroupMember, validate(createItinerarySchema), itineraryController.createItem);

// Update itinerary item
router.put('/:groupId/itinerary/:itemId', isGroupMember, validate(updateItinerarySchema), itineraryController.updateItem);

// Delete itinerary item
router.delete('/:groupId/itinerary/:itemId', isGroupAdmin, itineraryController.deleteItem);

// Vote on itinerary item
router.post('/:groupId/itinerary/:itemId/vote', isGroupMember, itineraryController.voteOnItem);

// Confirm itinerary item (admin)
router.put('/:groupId/itinerary/:itemId/confirm', isGroupAdmin, itineraryController.confirmItem);

module.exports = router;
