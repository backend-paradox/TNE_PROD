const Joi = require('joi');

const inviteMemberSchema = Joi.object({
  userId: Joi.number().integer().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('ADMIN', 'MODERATOR', 'MEMBER').default('MEMBER'),
  message: Joi.string().max(500).optional(),
}).or('userId', 'email');

const updateMemberSchema = Joi.object({
  role: Joi.string().valid('ADMIN', 'MODERATOR', 'MEMBER').required(),
});

module.exports = {
  inviteMemberSchema,
  updateMemberSchema,
};
