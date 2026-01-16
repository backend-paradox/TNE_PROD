const cartService = require('../services/cartService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.getCart(userId);

  res.status(200).json(
    ApiResponse.success(cart, 'Cart retrieved successfully')
  );
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { packageId, type, name, slug, image, price, duration, quantity } = req.body;

  if (!packageId || !type || !name || !slug || !price) {
    throw ApiError.badRequest('Missing required fields: packageId, type, name, slug, price');
  }

  const item = await cartService.addToCart(userId, {
    packageId,
    type,
    name,
    slug,
    image,
    price,
    duration,
    quantity,
  });

  res.status(201).json(
    ApiResponse.success(item, 'Item added to cart')
  );
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/:id
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined) {
    throw ApiError.badRequest('Quantity is required');
  }

  const item = await cartService.updateCartItem(userId, parseInt(id), quantity);

  if (item === null) {
    res.status(200).json(
      ApiResponse.success(null, 'Item removed from cart')
    );
  } else {
    res.status(200).json(
      ApiResponse.success(item, 'Cart item updated')
    );
  }
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/:id
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  await cartService.removeFromCart(userId, parseInt(id));

  res.status(200).json(
    ApiResponse.success(null, 'Item removed from cart')
  );
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await cartService.clearCart(userId);

  res.status(200).json(
    ApiResponse.success(null, 'Cart cleared')
  );
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
