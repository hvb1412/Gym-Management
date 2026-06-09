import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { sequelize, Account, Member } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.js';

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

export const createMember = catchAsync(async (req, res, next) => {
  const { email, password, memberName, phoneNumber, dateOfBirth, gender } =
    req.body;

  const transaction = await sequelize.transaction();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccount = await Account.create(
      { email, password: hashedPassword },
      { transaction },
    );

    const newMember = await Member.create(
      {
        accountId: newAccount.accountId,
        memberName,
        phoneNumber,
        dateOfBirth: dateOfBirth ?? null,
        gender: gender ?? null,
      },
      { transaction },
    );

    await transaction.commit();

    return successResponse(res, 201, 'Tạo hồ sơ hội viên thành công!', {
      member: {
        memberId: newMember.memberId,
        accountId: newAccount.accountId,
        email: newAccount.email,
        memberName: newMember.memberName,
        phoneNumber: newMember.phoneNumber,
        dateOfBirth: newMember.dateOfBirth,
        gender: newMember.gender,
        joinDate: newMember.joinDate,
      },
    });
  } catch (error) {
    await transaction.rollback();

    const duplicateMessage = buildDuplicateMessage(error);
    if (duplicateMessage) {
      return next(new AppError(duplicateMessage, 409));
    }

    return next(
      new AppError('Đã xảy ra lỗi trong quá trình tạo hồ sơ hội viên', 500),
    );
  }
});

export const getMembers = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  const where = {};

  if (search) {
    where[Op.or] = [
      { phoneNumber: { [Op.iLike]: `%${search}%` } },
      { memberName: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const members = await Member.findAll({
    where,
    include: [
      {
        model: Account,
        attributes: ['accountId', 'email'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return successResponse(res, 200, 'Lấy danh sách hội viên thành công!', {
    members,
  });
});
