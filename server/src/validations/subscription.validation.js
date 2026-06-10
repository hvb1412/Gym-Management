import Joi from 'joi';

export const createSubscriptionSchema = Joi.object({
  body: Joi.object({
    memberId: Joi.string().uuid().required().messages({
      'string.uuid': 'memberId phải là UUID hợp lệ',
      'any.required': 'Vui lòng cung cấp memberId',
    }),
    packageId: Joi.string().uuid().required().messages({
      'string.uuid': 'packageId phải là UUID hợp lệ',
      'any.required': 'Vui lòng cung cấp packageId',
    }),
  }),
});

export const paySubscriptionSchema = Joi.object({
  body: Joi.object({
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'transfer')
      .required()
      .messages({
        'any.only': "paymentMethod chỉ chấp nhận 'cash', 'card', hoặc 'transfer'",
        'any.required': 'Vui lòng cung cấp paymentMethod',
      }),
  }),
});

export const renewSubscriptionSchema = Joi.object({
  body: Joi.object({
    packageId: Joi.string().uuid().required().messages({
      'string.uuid': 'packageId phải là UUID hợp lệ',
      'any.required': 'Vui lòng cung cấp packageId',
    }),
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'transfer')
      .required()
      .messages({
        'any.only': "paymentMethod chỉ chấp nhận 'cash', 'card', hoặc 'transfer'",
        'any.required': 'Vui lòng cung cấp paymentMethod',
      }),
  }),
});
