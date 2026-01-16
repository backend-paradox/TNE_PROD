const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../../../shared/src/middleware/auth');

// All cart routes require authentication

// GET /api/v1/cart - Get user's cart
router.get('/', authenticate, cartController.getCart);

// POST /api/v1/cart - Add item to cart
router.post('/', authenticate, cartController.addToCart);

// PUT /api/v1/cart/:id - Update cart item quantity
router.put('/:id', authenticate, cartController.updateCartItem);

// DELETE /api/v1/cart/:id - Remove item from cart
router.delete('/:id', authenticate, cartController.removeFromCart);

// DELETE /api/v1/cart - Clear entire cart
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
