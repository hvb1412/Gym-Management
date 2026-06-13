import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { sequelize, Account, Member, SubscriptionPlan, SubscriptionPackage, Bill, WorkoutLog, Staff, Feedback } from '../models/index.js';
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

export const checkDuplicate = catchAsync(async (req, res, next) => {
  const { email, phoneNumber } = req.body;
  if (email) {
    const existingEmail = await Account.findOne({ where: { email } });
    if (existingEmail) return successResponse(res, 200, 'Duplicate', { isDuplicate: true, message: 'Email này đã được đăng ký' });
  }
  if (phoneNumber) {
    const existingPhone = await Member.findOne({ where: { phoneNumber } });
    if (existingPhone) return successResponse(res, 200, 'Duplicate', { isDuplicate: true, message: 'Số điện thoại này đã được đăng ký' });
  }
  return successResponse(res, 200, 'Ok', { isDuplicate: false, message: 'Hợp lệ' });
});

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
      {
        model: SubscriptionPlan,
        required: false,
        include: [
          {
            model: SubscriptionPackage,
            attributes: ['packageName', 'packageType', 'duration', 'durationUnit', 'numberOfWorkout'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  const result = members.map((m) => {
    const plain = m.toJSON();
    const activePlan = (plain.SubscriptionPlans || [])
      .filter((p) => p.status === 'active')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
    plain.activePlan = activePlan;
    return plain;
  });

  return successResponse(res, 200, 'Lấy danh sách hội viên thành công!', {
    members: result,
  });
});

export const getMemberById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const member = await Member.findByPk(id, {
    include: [
      { model: Account, attributes: ['email'] },
      {
        model: SubscriptionPlan,
        required: false,
        include: [{ model: SubscriptionPackage, attributes: ['packageName', 'packageType', 'duration', 'durationUnit', 'numberOfWorkout'] }],
      },
    ],
  });

  if (!member) return next(new AppError('Không tìm thấy hội viên', 404));

  const plain = member.toJSON();
  plain.activePlan = (plain.SubscriptionPlans || [])
    .filter((p) => p.status === 'active')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

  return successResponse(res, 200, 'Lấy thông tin hội viên thành công!', { member: plain });
});

export const updateMember = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { memberName, phoneNumber, dateOfBirth, gender, occupation } = req.body;

  const member = await Member.findByPk(id);
  if (!member) return next(new AppError('Không tìm thấy hội viên', 404));

  await member.update({ memberName, phoneNumber, dateOfBirth, gender, occupation });

  return successResponse(res, 200, 'Cập nhật hội viên thành công!', { member });
});

export const deleteMember = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const member = await Member.findByPk(id, {
    include: [{ model: Account, attributes: ['accountId'] }],
  });
  if (!member) return next(new AppError('Không tìm thấy hội viên', 404));

  const accountId = member.Account?.accountId;
  await member.destroy();
  if (accountId) {
    await Account.destroy({ where: { accountId } });
  }

  return successResponse(res, 200, 'Xóa hội viên thành công!');
});

export const getMemberWorkoutLogs = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const logs = await WorkoutLog.findAll({
    where: { memberId: id },
    include: [{ model: Staff, as: 'Recorder', attributes: ['staffName'] }],
    order: [['workoutDate', 'DESC'], ['startTime', 'DESC']],
  });

  return successResponse(res, 200, 'Lấy lịch sử tập luyện thành công!', { logs });
});

export const getMemberPayments = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const plans = await SubscriptionPlan.findAll({
    where: { memberId: id },
    include: [
      { model: SubscriptionPackage, attributes: ['packageName'] },
      { model: Bill },
    ],
    order: [['createdAt', 'DESC']],
  });

  return successResponse(res, 200, 'Lấy lịch sử thanh toán thành công!', { plans });
});

export const getMemberFeedbacksByStaff = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const feedbacks = await Feedback.findAll({
    where: { memberId: id },
    include: [
      {
        model: Staff,
        as: "Answerer",
        attributes: ["staffId", "staffName"]
      }
    ],
    order: [["feedbackDate", "DESC"], ["createdAt", "DESC"]]
  });

  return successResponse(res, 200, 'Lấy lịch sử phản hồi thành công!', { feedbacks });
});