const Joi = require('joi');

const createPollSchema = Joi.object({
  question: Joi.string().min(5).max(500).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DATE_POLL').default('SINGLE_CHOICE'),
  isAnonymous: Joi.boolean().default(false),
  endsAt: Joi.date().iso().greater('now').optional(),
  expiresAt: Joi.date().iso().greater('now').optional(),
  options: Joi.array().items(
    Joi.alternatives().try(
      Joi.string().max(200),
      Joi.object({
        text: Joi.string().max(200).required(),
        date: Joi.date().iso().optional(),
      })
    )
  ).min(2).max(10).required(),
});

module.exports = {
  createPollSchema,
};
