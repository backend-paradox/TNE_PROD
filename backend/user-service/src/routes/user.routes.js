const express = require('express');
const router = express.Router();

// Controllers
const userController = require('../controllers/user.controller');
const addressController = require('../controllers/address.controller');
const kycController = require('../controllers/kyc.controller');
const travelPreferencesController = require('../controllers/travelPreferences.controller');
const travelDocumentController = require('../controllers/travelDocument.controller');
const emergencyContactController = require('../controllers/emergencyContact.controller');
const blockController = require('../controllers/block.controller');
const connectionController = require('../controllers/connection.controller');
const activityController = require('../controllers/activity.controller');
const wishlistController = require('../controllers/wishlist.controller');
const reviewController = require('../controllers/review.controller');

// Middleware
const { authenticate, authorize } = require('../../../shared/src/middleware/auth');
const { validate } = require('../../../shared/src/middleware/validate');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');

// Validators
const {
  createProfileSchema,
  updateProfileSchema,
  addAddressSchema,
  updateAddressSchema,
  submitKYCSchema,
  verifyKYCSchema,
  paginationSchema,
  travelPreferencesSchema,
  addTravelDocumentSchema,
  updateTravelDocumentSchema,
  addEmergencyContactSchema,
  updateEmergencyContactSchema,
  blockUserSchema,
} = require('../validators/user.validator');

// ============ Profile Management Routes ============

// POST /api/v1/users/profile - Create user profile (called by auth-service)
router.post('/profile', userController.createProfile);

// GET /api/v1/users/profile - Get own profile
router.get('/profile', authenticate, userController.getProfile);

// PUT /api/v1/users/profile - Update own profile
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);

// GET /api/v1/users/by-email/:email - Get profile by email (internal)
router.get('/by-email/:email', userController.getProfileByEmail);

// PUT /api/v1/users/profile/avatar - Upload/update profile avatar
router.put('/profile/avatar', authenticate, uploadAvatarMiddleware, userController.uploadAvatar);

// DELETE /api/v1/users/profile/avatar - Delete profile avatar
router.delete('/profile/avatar', authenticate, userController.deleteAvatar);

// DELETE /api/v1/users/profile - Soft delete own profile
router.delete('/profile', authenticate, userController.deleteProfile);

// GET /api/v1/users/search - Search users
router.get('/search', authenticate, userController.searchUsers);
// GET /api/v1/users/interests/suggestions - Interest suggestions
router.get('/interests/suggestions', authenticate, userController.getInterestSuggestions);

// ============ Location & Nearby Travellers Routes ============

// PUT /api/v1/users/location - Update current location
router.put('/location', authenticate, userController.updateLocation);

// GET /api/v1/users/nearby - Get nearby travellers
router.get('/nearby', authenticate, userController.getNearbyTravellers);

// ============ Address Management Routes ============

// GET /api/v1/users/addresses - Get all addresses
router.get('/addresses', authenticate, addressController.getAddresses);

// POST /api/v1/users/addresses - Add new address
router.post('/addresses', authenticate, validate(addAddressSchema), addressController.addAddress);

// PUT /api/v1/users/addresses/:addressId - Update address
router.put('/addresses/:addressId', authenticate, validate(updateAddressSchema), addressController.updateAddress);

// DELETE /api/v1/users/addresses/:addressId - Delete address
router.delete('/addresses/:addressId', authenticate, addressController.deleteAddress);

// ============ KYC Management Routes ============

// GET /api/v1/users/kyc - Get KYC status summary
router.get('/kyc', authenticate, kycController.getKYCStatus);

// GET /api/v1/users/kyc/documents - Get all KYC documents
router.get('/kyc/documents', authenticate, kycController.getKYCDocuments);

// GET /api/v1/users/kyc/documents/:documentId - Get specific KYC document
router.get('/kyc/documents/:documentId', authenticate, kycController.getKYCDocument);

// POST /api/v1/users/kyc/documents - Submit new KYC document
router.post('/kyc/documents', authenticate, validate(submitKYCSchema), kycController.submitKYCDocument);

// ============ Travel Preferences Routes ============

// GET /api/v1/users/travel-preferences - Get travel preferences
router.get('/travel-preferences', authenticate, travelPreferencesController.getTravelPreferences);

// PUT /api/v1/users/travel-preferences - Create/update travel preferences
router.put(
  '/travel-preferences',
  authenticate,
  validate(travelPreferencesSchema),
  travelPreferencesController.upsertTravelPreferences
);

// DELETE /api/v1/users/travel-preferences - Delete travel preferences
router.delete('/travel-preferences', authenticate, travelPreferencesController.deleteTravelPreferences);

// ============ Travel Documents Routes ============

// GET /api/v1/users/travel-documents - Get all travel documents
router.get('/travel-documents', authenticate, travelDocumentController.getTravelDocuments);

// GET /api/v1/users/travel-documents/expiring - Get expiring documents
router.get('/travel-documents/expiring', authenticate, travelDocumentController.getExpiringDocuments);

// POST /api/v1/users/travel-documents - Add travel document
router.post(
  '/travel-documents',
  authenticate,
  validate(addTravelDocumentSchema),
  travelDocumentController.addTravelDocument
);

// PUT /api/v1/users/travel-documents/:id - Update travel document
router.put(
  '/travel-documents/:id',
  authenticate,
  validate(updateTravelDocumentSchema),
  travelDocumentController.updateTravelDocument
);

// DELETE /api/v1/users/travel-documents/:id - Delete travel document
router.delete('/travel-documents/:id', authenticate, travelDocumentController.deleteTravelDocument);

// ============ Emergency Contacts Routes ============

// GET /api/v1/users/emergency-contacts - Get all emergency contacts
router.get('/emergency-contacts', authenticate, emergencyContactController.getEmergencyContacts);

// POST /api/v1/users/emergency-contacts - Add emergency contact
router.post(
  '/emergency-contacts',
  authenticate,
  validate(addEmergencyContactSchema),
  emergencyContactController.addEmergencyContact
);

// PUT /api/v1/users/emergency-contacts/:id - Update emergency contact
router.put(
  '/emergency-contacts/:id',
  authenticate,
  validate(updateEmergencyContactSchema),
  emergencyContactController.updateEmergencyContact
);

// DELETE /api/v1/users/emergency-contacts/:id - Delete emergency contact
router.delete('/emergency-contacts/:id', authenticate, emergencyContactController.deleteEmergencyContact);

// ============ Block Routes ============

// GET /api/v1/users/blocked - Get blocked users
router.get('/blocked', authenticate, blockController.getBlockedUsers);

// POST /api/v1/users/block - Block a user
router.post('/block', authenticate, validate(blockUserSchema), blockController.blockUser);

// DELETE /api/v1/users/block/:userId - Unblock a user
router.delete('/block/:userId', authenticate, blockController.unblockUser);

// GET /api/v1/users/block/:userId/status - Check block status
router.get('/block/:userId/status', authenticate, blockController.checkBlockStatus);

// ============ Connection/Friend Routes ============

// GET /api/v1/users/connections - Get all connections (friends)
router.get('/connections', authenticate, connectionController.getConnections);

// GET /api/v1/users/connections/pending - Get pending connection requests
router.get('/connections/pending', authenticate, connectionController.getPendingRequests);

// GET /api/v1/users/connections/sent - Get sent connection requests
router.get('/connections/sent', authenticate, connectionController.getSentRequests);

// GET /api/v1/users/connections/suggestions - Get suggested connections
router.get('/connections/suggestions', authenticate, connectionController.getSuggestedConnections);

// POST /api/v1/users/connections/request - Send connection request
router.post('/connections/request', authenticate, connectionController.sendConnectionRequest);

// POST /api/v1/users/connections/:connectionId/accept - Accept connection request
router.post('/connections/:connectionId/accept', authenticate, connectionController.acceptConnection);

// POST /api/v1/users/connections/:connectionId/reject - Reject connection request
router.post('/connections/:connectionId/reject', authenticate, connectionController.rejectConnection);

// DELETE /api/v1/users/connections/request/:connectionId - Cancel sent request
router.delete('/connections/request/:connectionId', authenticate, connectionController.cancelRequest);

// DELETE /api/v1/users/connections/:userId - Remove connection (unfriend)
router.delete('/connections/:userId', authenticate, connectionController.removeConnection);

// GET /api/v1/users/connections/:userId/status - Get connection status with user
router.get('/connections/:userId/status', authenticate, connectionController.getConnectionStatus);

// GET /api/v1/users/connections/:userId/mutual - Get mutual connections
router.get('/connections/:userId/mutual', authenticate, connectionController.getMutualConnections);

// ============ Wishlist Routes ============

// GET /api/v1/users/wishlist - Get user's wishlist
router.get('/wishlist', authenticate, wishlistController.getWishlist);

// POST /api/v1/users/wishlist - Add item to wishlist
router.post('/wishlist', authenticate, wishlistController.addToWishlist);

// PUT /api/v1/users/wishlist/:itemId - Update wishlist item
router.put('/wishlist/:itemId', authenticate, wishlistController.updateWishlistItem);

// DELETE /api/v1/users/wishlist/:itemId - Remove item from wishlist
router.delete('/wishlist/:itemId', authenticate, wishlistController.removeFromWishlist);

// GET /api/v1/users/wishlist/check - Check if item is in wishlist
router.get('/wishlist/check', authenticate, wishlistController.checkWishlist);

// DELETE /api/v1/users/wishlist - Clear entire wishlist
router.delete('/wishlist', authenticate, wishlistController.clearWishlist);

// ============ Review Routes ============

// GET /api/v1/users/reviews - Get user's own reviews
router.get('/reviews', authenticate, reviewController.getMyReviews);

// POST /api/v1/users/reviews - Submit a new review
router.post('/reviews', authenticate, reviewController.submitReview);

// PUT /api/v1/users/reviews/:reviewId - Update a review
router.put('/reviews/:reviewId', authenticate, reviewController.updateReview);

// DELETE /api/v1/users/reviews/:reviewId - Delete a review
router.delete('/reviews/:reviewId', authenticate, reviewController.deleteReview);

// GET /api/v1/users/reviews/:type/:targetId - Get reviews for an item (package, hotel, etc.)
router.get('/reviews/:type/:targetId', reviewController.getItemReviews);

// POST /api/v1/users/reviews/:reviewId/helpful - Mark review as helpful
router.post('/reviews/:reviewId/helpful', authenticate, reviewController.markHelpful);

// POST /api/v1/users/reviews/:reviewId/report - Report a review
router.post('/reviews/:reviewId/report', authenticate, reviewController.reportReview);

// ============ Activity & Stats Routes ============

// GET /api/v1/users/activity-feed - Get user's activity feed (self + connections)
router.get('/activity-feed', authenticate, activityController.getActivityFeed);

// GET /api/v1/users/activities - Get user's own activities
router.get('/activities', authenticate, activityController.getMyActivities);

// POST /api/v1/users/activities - Create activity
router.post('/activities', authenticate, activityController.createActivity);

// GET /api/v1/users/stats - Get user's stats
router.get('/stats', authenticate, activityController.getMyStats);

// ============ Public Profile Routes (viewing other users) ============

// GET /api/v1/users/:userId/public-profile - Get public profile of a user
router.get('/:userId/public-profile', authenticate, activityController.getPublicProfile);

// GET /api/v1/users/:userId/activities - Get user's public activities
router.get('/:userId/activities', authenticate, activityController.getUserActivities);

// GET /api/v1/users/:userId/stats - Get user's public stats
router.get('/:userId/stats', authenticate, activityController.getUserStats);

// GET /api/v1/users/:userId/compatibility - Calculate compatibility with user
router.get('/:userId/compatibility', authenticate, activityController.getCompatibility);

// ============ Batch Operations (for internal service calls) ============

// POST /api/v1/users/profiles/batch - Get user profiles in batch
router.post('/profiles/batch', userController.getUserProfilesBatch);

// POST /api/v1/users/connections/status/batch - Get connection statuses in batch
router.post('/connections/status/batch', userController.getConnectionStatusesBatch);

// ============ Admin Routes ============

// GET /api/v1/users - Get all user profiles (admin only)
router.get('/', authenticate, authorize(['ADMIN']), validate(paginationSchema), userController.getAllProfiles);

// GET /api/v1/users/kyc/admin/documents - Get all KYC documents (admin only)
router.get(
  '/kyc/admin/documents',
  authenticate,
  authorize(['ADMIN']),
  validate(paginationSchema),
  kycController.getAllKYCDocuments
);

// PUT /api/v1/users/kyc/admin/documents/:documentId/verify - Verify/reject KYC (admin only)
router.put(
  '/kyc/admin/documents/:documentId/verify',
  authenticate,
  authorize(['ADMIN']),
  validate(verifyKYCSchema),
  kycController.verifyKYCDocument
);

// POST /api/v1/users/:id/verify - Verify a user (admin only)
router.post('/:id/verify', authenticate, authorize(['ADMIN']), userController.verifyUser);

// POST /api/v1/users/:id/unverify - Unverify a user (admin only)
router.post('/:id/unverify', authenticate, authorize(['ADMIN']), userController.unverifyUser);

// PUT /api/v1/users/:id/stats - Update user stats (admin only)
router.put('/:id/stats', authenticate, authorize(['ADMIN']), userController.updateUserStats);

// PUT /api/v1/users/:id/vibe-score - Update social vibe score (admin only)
router.put('/:id/vibe-score', authenticate, authorize(['ADMIN']), userController.updateVibeScore);

// GET /api/v1/users/:id - Get user profile by ID (admin only) - MUST BE LAST
router.get('/:id', authenticate, authorize(['ADMIN']), userController.getProfileById);

module.exports = router;
