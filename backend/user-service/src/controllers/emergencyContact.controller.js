const userService = require('../services/userService');
const { ApiError, ApiResponse } = require('../../../shared/src/utils');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');

/**
 * @desc    Get all emergency contacts
 * @route   GET /api/v1/users/emergency-contacts
 * @access  Private
 */
const getEmergencyContacts = asyncHandler(async (req, res) => {
  const authId = req.user.id;

  const contacts = await userService.getEmergencyContacts(authId);

  res.status(200).json(
    ApiResponse.success(contacts, 'Emergency contacts retrieved successfully')
  );
});

/**
 * @desc    Add an emergency contact
 * @route   POST /api/v1/users/emergency-contacts
 * @access  Private
 */
const addEmergencyContact = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const contactData = req.body;

  const contact = await userService.addEmergencyContact(authId, contactData);

  res.status(201).json(
    ApiResponse.success(contact, 'Emergency contact added successfully')
  );
});

/**
 * @desc    Update an emergency contact
 * @route   PUT /api/v1/users/emergency-contacts/:id
 * @access  Private
 */
const updateEmergencyContact = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const contactId = parseInt(req.params.id);
  const contactData = req.body;

  const contact = await userService.updateEmergencyContact(authId, contactId, contactData);

  res.status(200).json(
    ApiResponse.success(contact, 'Emergency contact updated successfully')
  );
});

/**
 * @desc    Delete an emergency contact
 * @route   DELETE /api/v1/users/emergency-contacts/:id
 * @access  Private
 */
const deleteEmergencyContact = asyncHandler(async (req, res) => {
  const authId = req.user.id;
  const contactId = parseInt(req.params.id);

  await userService.deleteEmergencyContact(authId, contactId);

  res.status(200).json(
    ApiResponse.success(null, 'Emergency contact deleted successfully')
  );
});

module.exports = {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
};
