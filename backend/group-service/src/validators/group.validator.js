const Joi = require('joi');

const createGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).optional(),
  imageUrl: Joi.alternatives()
    .try(
      Joi.string().uri({ scheme: ['http', 'https'] }),
      Joi.string().pattern(/^data:image\/[a-zA-Z]+;base64,/)
    )
    .optional(),
  destination: Joi.string().max(200).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  budget: Joi.number().positive().optional(),
  budgetPerPerson: Joi.number().positive().optional(),
  currency: Joi.string().length(3).default('INR'),
  type: Joi.string().valid('PUBLIC', 'PRIVATE').default('PRIVATE'),
  maxMembers: Joi.number().integer().min(2).max(50).default(20),
});

const updateGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(1000).optional(),
  imageUrl: Joi.alternatives()
    .try(
      Joi.string().uri({ scheme: ['http', 'https'] }),
      Joi.string().pattern(/^data:image\/[a-zA-Z]+;base64,/)
    )
    .optional(),
  destination: Joi.string().max(200).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  manualStartDate: Joi.date().iso().allow(null).optional(),
  manualEndDate: Joi.date().iso().allow(null).optional(),
  status: Joi.string().valid('PLANNING', 'ON_TOUR', 'COMPLETED').optional(),
  budget: Joi.number().positive().allow(null).optional(),
  budgetPerPerson: Joi.number().positive().optional(),
  currency: Joi.string().length(3).optional(),
  type: Joi.string().valid('PUBLIC', 'PRIVATE').optional(),
  maxMembers: Joi.number().integer().min(2).max(50).optional(),
}).min(1);

module.exports = {
  createGroupSchema,
  updateGroupSchema,
};
