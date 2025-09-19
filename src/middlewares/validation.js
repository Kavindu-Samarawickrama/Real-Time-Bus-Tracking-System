const Joi = require("joi");
const { ValidationError } = require("../utils/errors");

const validateSchema = async (schema, data, options = {}) => {
  try {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      ...options,
    };

    const { error, value } = schema.validate(data, validationOptions);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      throw new ValidationError(errorMessage);
    }

    return value;
  } catch (error) {
    throw error;
  }
};

const validate = (schema, property = "body") => {
  return async (req, res, next) => {
    try {
      const data = req[property];
      req[property] = await validateSchema(schema, data);
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateSchema,
  validate,
};
