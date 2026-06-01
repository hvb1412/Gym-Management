import bcrypt from 'bcryptjs';
import { sequelize, Account, Staff } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { successResponse } from '../utils/response.js';
import catchAsync from '../utils/catchAsync.js';

const buildDuplicateMessage = (error) => {
  if (error?.name !== 'SequelizeUniqueConstraintError') return null;

  const paths = (error.errors || [])
    .map((e) => e.path)
    .filter(Boolean)
    .map(String);

  if (paths.some((p) => p.includes('email'))) {
    return 'Email này đã được đăng ký';
  }

  if (paths.some((p) => p.includes('phone'))) {
    return 'Số điện thoại này đã được sử dụng';
  }

  return 'Dữ liệu bị trùng lặp';
};

export const createStaff = catchAsync(async (req, res, next) => {
  const { email, password, staffName, phoneNumber, position } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await Account.create(
      { email, password: hashedPassword },
      { transaction },
    );

    const newStaff = await Staff.create(
      {
        accountId: newAccount.accountId,
        staffName,
        phoneNumber,
        position,
      },
      { transaction },
    );

    await transaction.commit();

    return successResponse(res, 201, 'Tạo hồ sơ nhân sự thành công!', {
      staff: {
        staffId: newStaff.staffId,
        accountId: newAccount.accountId,
        email: newAccount.email,
        staffName: newStaff.staffName,
        phoneNumber: newStaff.phoneNumber,
        position: newStaff.position,
        registerDate: newStaff.registerDate,
      },
    });
  } catch (error) {
    await transaction.rollback();

    const duplicateMessage = buildDuplicateMessage(error);
    if (duplicateMessage) {
      return next(new AppError(duplicateMessage, 409));
    }

    return next(new AppError('Đã xảy ra lỗi trong quá trình tạo hồ sơ nhân sự', 500));
  }
});

export const getStaffs = catchAsync(async (req, res, next) => {
  const { position } = req.query;

  const where = {};
  if (position) where.position = position;

  const staffs = await Staff.findAll({
    where,
    include: [
      {
        model: Account,
        attributes: ['accountId', 'email'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return successResponse(res, 200, 'Lấy danh sách nhân sự thành công!', {
    staffs,
  });
});
