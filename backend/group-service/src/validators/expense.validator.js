const Joi = require('joi');

const createExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().valid(
    'ACCOMMODATION', 'TRANSPORT', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'TIPS', 'OTHER'
  ).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('INR'),
  date: Joi.date().iso().optional(),
  paidBy: Joi.number().integer().required(),
  receiptUrl: Joi.string().uri().optional(),
  splitType: Joi.string().valid('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES').default('EQUAL'),
  splits: Joi.array().items(
    Joi.object({
      userId: Joi.number().integer().required(),
      amount: Joi.number().min(0).optional(),
      percentage: Joi.number().min(0).max(100).optional(),
      shares: Joi.number().integer().positive().optional(),
    })
  ).when('splitType', {
    is: Joi.valid('EXACT', 'PERCENTAGE', 'SHARES'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const updateExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  category: Joi.string().valid(
    'ACCOMMODATION', 'TRANSPORT', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'TIPS', 'OTHER'
  ).optional(),
  amount: Joi.number().positive().optional(),
  currency: Joi.string().length(3).optional(),
  date: Joi.date().iso().optional(),
  receiptUrl: Joi.string().uri().optional(),
}).min(1);

const settleExpenseSchema = Joi.object({
  userId: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  settleExpenseSchema,
};
