const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get KYC status summary for authenticated user
 * @route   GET /api/v1/users/kyc
 * @access  Private
 */
const getKYCStatus = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const kycStatus = await userService.getKYCStatus(authId);

  res.status(200).json(ApiResponse.success(kycStatus, 'KYC status retrieved successfully'));
});

/**
 * @desc    Get all KYC documents for authenticated user
 * @route   GET /api/v1/users/kyc/documents
 * @access  Private
 */
const getKYCDocuments = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const documents = await userService.getKYCDocuments(authId);

  res.status(200).json(ApiResponse.success(documents, 'KYC documents retrieved successfully'));
});

/**
 * @desc    Get specific KYC document
 * @route   GET /api/v1/users/kyc/documents/:documentId
 * @access  Private
 */
const getKYCDocument = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const { documentId } = req.params;

  const document = await userService.getKYCDocument(authId, parseInt(documentId));
  if (!document) {
    throw ApiError.notFound('KYC document not found');
  }

  res.status(200).json(ApiResponse.success(document, 'KYC document retrieved successfully'));
});

/**
 * @desc    Submit new KYC document
 * @route   POST /api/v1/users/kyc/documents
 * @access  Private
 */
const submitKYCDocument = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const kycData = req.body;

  const document = await userService.submitKYCDocument(authId, kycData);

  res.status(201).json(ApiResponse.success(document, 'KYC document submitted successfully'));
});

/**
 * @desc    Get all KYC documents (admin only)
 * @route   GET /api/v1/users/kyc/admin/documents
 * @access  Private/Admin
 */
const getAllKYCDocuments = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const result = await userService.getAllKYCDocuments({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
  });

  res.status(200).json(
    ApiResponse.success(result, 'KYC documents retrieved successfully')
  );
});

/**
 * @desc    Verify or reject KYC document (admin only)
 * @route   PUT /api/v1/users/kyc/admin/documents/:documentId/verify
 * @access  Private/Admin
 */
const verifyKYCDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { status, rejectionReason } = req.body;
  const adminId = req.user.id;

  if (status === 'REJECTED' && !rejectionReason) {
    throw ApiError.badRequest('Rejection reason is required when rejecting KYC');
  }

  const document = await userService.verifyKYCDocument(
    parseInt(documentId),
    adminId,
    status,
    rejectionReason
  );

  res.status(200).json(
    ApiResponse.success(document, `KYC document ${status.toLowerCase()} successfully`)
  );
});

module.exports = {
  getKYCStatus,
  getKYCDocuments,
  getKYCDocument,
  submitKYCDocument,
  getAllKYCDocuments,
  verifyKYCDocument,
};
