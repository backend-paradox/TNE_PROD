const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get all addresses for authenticated user
 * @route   GET /api/v1/users/addresses
 * @access  Private
 */
const getAddresses = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const addresses = await userService.getAddresses(authId);

  res.status(200).json(ApiResponse.success(addresses, 'Addresses retrieved successfully'));
});

/**
 * @desc    Add new address for authenticated user
 * @route   POST /api/v1/users/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const addressData = req.body;

  const address = await userService.addAddress(authId, addressData);

  res.status(201).json(ApiResponse.success(address, 'Address added successfully'));
});

/**
 * @desc    Update address
 * @route   PUT /api/v1/users/addresses/:addressId
 * @access  Private
 */
const updateAddress = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { addressId } = req.params;
  const addressData = req.body;

  const address = await userService.updateAddress(
    authId,
    parseInt(addressId),
    addressData
  );

  res.status(200).json(ApiResponse.success(address, 'Address updated successfully'));
});

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/users/addresses/:addressId
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { addressId } = req.params;

  await userService.deleteAddress(authId, parseInt(addressId));

  res.status(200).json(ApiResponse.success(null, 'Address deleted successfully'));
});

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
