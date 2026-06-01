import Joi from 'joi';

export const createPackageSchema = Joi.object({
  body: Joi.object({
    packageName: Joi.string().trim().min(2).required().messages({
      'string.min': 'packageName phải có ít nhất 2 ký tự',
      'any.required': 'Vui lòng cung cấp packageName',
    }),
    packageType: Joi.string().trim().required().messages({
      'any.required': 'Vui lòng cung cấp packageType',
    }),
    price: Joi.number().positive().required().messages({
      'number.base': 'price phải là số',
      'number.positive': 'price phải lớn hơn 0',
      'any.required': 'Vui lòng cung cấp price',
    }),
    isPtIncluded: Joi.boolean().default(false),
    isVip: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),

    numberOfWorkouts: Joi.number()
      .integer()
      .allow(null)
      .when('packageType', {
        is: 'session',
        then: Joi.number().integer().greater(0).required().messages({
          'number.greater': 'numberOfWorkouts phải lớn hơn 0 khi packageType = session',
          'any.required': 'Vui lòng cung cấp numberOfWorkouts khi packageType = session',
        }),
        otherwise: Joi.number().integer().min(0).optional(),
      }),
  }),
});

export const getPackageSchema = Joi.object({
  query: Joi.object({}).unknown(true),
});
