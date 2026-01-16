const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticate } = require('../../../shared/src/middleware/auth');

// All wishlist routes require authentication

// GET /api/v1/wishlist - Get user's wishlist
router.get('/', authenticate, wishlistController.getWishlist);

// GET /api/v1/wishlist/ids - Get wishlist IDs only (for quick lookup)
router.get('/ids', authenticate, wishlistController.getWishlistIds);

// GET /api/v1/wishlist/check/:packageId - Check if item is in wishlist
router.get('/check/:packageId', authenticate, wishlistController.checkWishlist);

// POST /api/v1/wishlist - Add item to wishlist
router.post('/', authenticate, wishlistController.addToWishlist);

// POST /api/v1/wishlist/toggle - Toggle wishlist item (add/remove)
router.post('/toggle', authenticate, wishlistController.toggleWishlist);

// DELETE /api/v1/wishlist/:packageId - Remove item from wishlist
router.delete('/:packageId', authenticate, wishlistController.removeFromWishlist);

// DELETE /api/v1/wishlist - Clear entire wishlist
router.delete('/', authenticate, wishlistController.clearWishlist);

module.exports = router;
