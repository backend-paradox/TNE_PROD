const Joi = require('joi');

const createItinerarySchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  location: Joi.string().max(200).optional(),
  address: Joi.string().max(500).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  date: Joi.date().iso().required(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: Joi.number().integer().positive().optional(),
  category: Joi.string().valid(
    'TRANSPORT', 'ACCOMMODATION', 'ACTIVITY', 'FOOD', 'SIGHTSEEING', 'FREE_TIME', 'OTHER'
  ).required(),
  bookingId: Joi.string().uuid().optional(),
  estimatedCost: Joi.number().min(0).optional(),
});

const updateItinerarySchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  location: Joi.string().max(200).optional(),
  address: Joi.string().max(500).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  date: Joi.date().iso().optional(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: Joi.number().integer().positive().optional(),
  category: Joi.string().valid(
    'TRANSPORT', 'ACCOMMODATION', 'ACTIVITY', 'FOOD', 'SIGHTSEEING', 'FREE_TIME', 'OTHER'
  ).optional(),
  estimatedCost: Joi.number().min(0).optional(),
  actualCost: Joi.number().min(0).optional(),
}).min(1);

module.exports = {
  createItinerarySchema,
  updateItinerarySchema,
};
