import Joi from 'joi';

export const createStaffSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email không đúng định dạng',
      'any.required': 'Vui lòng nhập email!',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Vui lòng nhập mật khẩu!',
    }),
    staffName: Joi.string().trim().min(2).required().messages({
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'any.required': 'Vui lòng nhập họ và tên!',
    }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .required()
      .messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ (10-11 số)',
        'any.required': 'Vui lòng nhập số điện thoại!',
      }),
    position: Joi.string().valid('manager', 'pt').required().messages({
      'any.only': 'Vị trí chỉ được phép là manager hoặc pt',
      'any.required': 'Vui lòng chọn vị trí!',
    }),
  }),
});
