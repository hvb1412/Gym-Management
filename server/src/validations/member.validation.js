import Joi from 'joi';

export const createMemberSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email không đúng định dạng',
      'any.required': 'Vui lòng cung cấp email',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Vui lòng cung cấp password',
    }),
    memberName: Joi.string().trim().min(2).required().messages({
      'string.min': 'memberName phải có ít nhất 2 ký tự',
      'any.required': 'Vui lòng cung cấp memberName',
    }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .required()
      .messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)',
        'any.required': 'Vui lòng cung cấp phoneNumber',
      }),
    dateOfBirth: Joi.date().iso().optional().messages({
      'date.base': 'dateOfBirth phải là ngày hợp lệ (YYYY-MM-DD)',
    }),
    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
      'any.only': "gender chỉ chấp nhận 'male', 'female', hoặc 'other'",
    }),
  }),
});

export const getMembersSchema = Joi.object({
  query: Joi.object({
    search: Joi.string().trim().min(1).optional().messages({
      'string.min': 'search phải có ít nhất 1 ký tự',
    }),
  }),
});
