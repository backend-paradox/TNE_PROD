const Joi = require('joi');

const sendMessageSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
  type: Joi.string().valid('TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO', 'LOCATION').default('TEXT'),
  content: Joi.string().max(5000).when('type', {
    is: 'TEXT',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  replyToId: Joi.string().uuid().optional(),
  attachments: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('IMAGE', 'FILE', 'AUDIO', 'VIDEO').required(),
      fileName: Joi.string().required(),
      fileSize: Joi.number().integer().required(),
      mimeType: Joi.string().required(),
      url: Joi.string().uri().required(),
      thumbnailUrl: Joi.string().uri().optional(),
      width: Joi.number().integer().optional(),
      height: Joi.number().integer().optional(),
      duration: Joi.number().integer().optional(),
    })
  ).optional(),
});

const updateMessageSchema = Joi.object({
  content: Joi.string().max(5000).required(),
});

module.exports = {
  sendMessageSchema,
  updateMessageSchema,
};
