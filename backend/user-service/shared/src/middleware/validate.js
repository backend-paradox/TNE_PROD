const Joi = require('joi');
const { z } = require('zod');
const ApiError = require('../utils/ApiError');

const validateJoi = (schema) => {
  return (req, res, next) => {
    const validSchema = {};
    ['params', 'query', 'body'].forEach((key) => {
      if (schema[key]) {
        validSchema[key] = req[key];
      }
    });

    const { value, error } = Joi.compile(schema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(validSchema);

    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(ApiError.badRequest(errorMessage));
    }

    Object.assign(req, value);
    return next();
  };
};

const validateZod = (schema) => {
  return async (req, res, next) => {
    try {
      // Build validation object from request
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const validated = await schema.parseAsync(dataToValidate);

      // Merge validated data back to request
      if (validated.body) req.body = validated.body;
      if (validated.query) req.query = validated.query;
      if (validated.params) req.params = validated.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(ApiError.badRequest(errorMessage));
      }
      next(error);
    }
  };
};

module.exports = {
  validate: validateZod, // Default to Zod validation
  validateJoi,
  validateZod,
};
