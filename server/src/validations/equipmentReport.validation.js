import Joi from 'joi';

export const createReportSchema = Joi.object({
  body: Joi.object({
    equipmentId: Joi.string().uuid().required().messages({
      'string.uuid': 'equipmentId phải là UUID hợp lệ',
      'any.required': 'Vui lòng cung cấp equipmentId',
    }),
    description: Joi.string().allow('', null).max(2000).optional().messages({
      'string.max': 'Mô tả lỗi không được vượt quá 2000 ký tự',
    }),
  }),
});

export const resolveReportSchema = Joi.object({
  body: Joi.object({
    resolveStatus: Joi.string().valid('resolved').required().messages({
      'any.only': "resolveStatus chỉ chấp nhận giá trị 'resolved'",
      'any.required': 'Vui lòng cung cấp resolveStatus',
    }),
  }),
});
