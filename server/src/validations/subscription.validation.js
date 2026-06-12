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
    trainerId: Joi.string().uuid().optional().allow(null, '').messages({
      'string.uuid': 'trainerId phải là UUID hợp lệ',
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
    amount: Joi.number().optional(),
    memberId: Joi.string().uuid().optional().messages({
      'string.uuid': 'memberId phải là UUID hợp lệ',
    }),
    trainerId: Joi.string().uuid().optional().allow(null, '').messages({
      'string.uuid': 'trainerId phải là UUID hợp lệ',
    }),
  }),
});
