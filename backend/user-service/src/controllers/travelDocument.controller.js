const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get all travel documents
 * @route   GET /api/v1/users/travel-documents
 * @access  Private
 */
const getTravelDocuments = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const documents = await userService.getTravelDocuments(authId);

  res.status(200).json(
    ApiResponse.success(documents, 'Travel documents retrieved successfully')
  );
});

/**
 * @desc    Add a travel document
 * @route   POST /api/v1/users/travel-documents
 * @access  Private
 */
const addTravelDocument = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const documentData = req.body;

  const document = await userService.addTravelDocument(authId, documentData);

  res.status(201).json(
    ApiResponse.success(document, 'Travel document added successfully')
  );
});

/**
 * @desc    Update a travel document
 * @route   PUT /api/v1/users/travel-documents/:id
 * @access  Private
 */
const updateTravelDocument = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const documentId = parseInt(req.params.id);
  const documentData = req.body;

  const document = await userService.updateTravelDocument(authId, documentId, documentData);

  res.status(200).json(
    ApiResponse.success(document, 'Travel document updated successfully')
  );
});

/**
 * @desc    Delete a travel document
 * @route   DELETE /api/v1/users/travel-documents/:id
 * @access  Private
 */
const deleteTravelDocument = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const documentId = parseInt(req.params.id);

  await userService.deleteTravelDocument(authId, documentId);

  res.status(200).json(
    ApiResponse.success(null, 'Travel document deleted successfully')
  );
});

/**
 * @desc    Get expiring documents
 * @route   GET /api/v1/users/travel-documents/expiring
 * @access  Private
 */
const getExpiringDocuments = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const daysAhead = parseInt(req.query.days) || 30;

  const documents = await userService.getExpiringDocuments(authId, daysAhead);

  res.status(200).json(
    ApiResponse.success(documents, 'Expiring documents retrieved successfully')
  );
});

module.exports = {
  getTravelDocuments,
  addTravelDocument,
  updateTravelDocument,
  deleteTravelDocument,
  getExpiringDocuments,
};
