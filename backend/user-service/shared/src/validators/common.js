const Joi = require('joi');
const { z } = require('zod');
const { REGEX } = require('../utils/constants');

// Joi Validators
const joiEmail = Joi.string().email().required();
const joiPhone = Joi.string().pattern(REGEX.PHONE).required();
const joiPassword = Joi.string().min(8).max(128).required();
const joiId = Joi.number().integer().positive().required();
const joiUuid = Joi.string().uuid().required();
const joiPagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};

// Zod Validators
const zodEmail = z.string().email('Invalid email format');
const zodPhone = z.string().regex(REGEX.PHONE, 'Invalid phone number format');
const zodPassword = z.string().min(8, 'Password must be at least 8 characters').max(128);
const zodId = z.number().int().positive();
const zodUuid = z.string().uuid();
const zodPagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  joi: {
    email: joiEmail,
    phone: joiPhone,
    password: joiPassword,
    id: joiId,
    uuid: joiUuid,
    pagination: joiPagination,
  },
  zod: {
    email: zodEmail,
    phone: zodPhone,
    password: zodPassword,
    id: zodId,
    uuid: zodUuid,
    pagination: zodPagination,
  },
};
