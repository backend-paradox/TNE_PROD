const Joi = require('joi');

const createConversationSchema = Joi.object({
  type: Joi.string().valid('DIRECT', 'GROUP', 'SUPPORT').default('DIRECT'),
  name: Joi.string().max(100).when('type', {
    is: 'GROUP',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  description: Joi.string().max(500).optional(),
  participantIds: Joi.array().items(Joi.number().integer()).min(1).required(),
  groupId: Joi.string().uuid().optional(),
});

const updateConversationSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  imageUrl: Joi.string().uri().optional(),
});

module.exports = {
  createConversationSchema,
  updateConversationSchema,
};
