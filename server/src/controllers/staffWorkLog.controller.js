import { Op } from 'sequelize';
import { sequelize, Staff, StaffWorkLog } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.js';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const getTodayDateString = () => {
  // YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

const getCurrentTimeString = () => {
  // HH:mm:ss
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
};

const resolveStaffId = async (req, transaction) => {
  const tokenStaffId = req.user?.staffId;
  if (tokenStaffId) return tokenStaffId;

  const accountId = req.user?.accountId;
  if (!accountId) {
    throw new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập!', 401);
  }

  const staff = await Staff.findOne({
    where: { accountId },
    attributes: ['staffId'],
    transaction,
  });

  if (!staff) {
    throw new AppError('Tài khoản này không phải nhân sự!', 403);
  }

  return staff.staffId;
};

export const checkIn = catchAsync(async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const staffId = await resolveStaffId(req, t);
    const workDate = getTodayDateString();

    const existed = await StaffWorkLog.findOne({
      where: {
        staffId: { [Op.eq]: staffId },
        workDate: { [Op.eq]: workDate },
      },
      transaction: t,
    });

    if (existed) {
      throw new AppError('Bạn đã check-in hôm nay rồi!', 409);
    }

    const log = await StaffWorkLog.create(
      {
        staffId,
        workDate,
        checkInTime: getCurrentTimeString(),
      },
      { transaction: t },
    );

    await t.commit();
    return successResponse(res, 201, 'Check-in thành công!', { workLog: log });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});

export const checkOut = catchAsync(async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const staffId = await resolveStaffId(req, t);
    const workDate = getTodayDateString();

    const log = await StaffWorkLog.findOne({
      where: {
        staffId: { [Op.eq]: staffId },
        workDate: { [Op.eq]: workDate },
      },
      transaction: t,
    });

    if (!log) {
      throw new AppError('Bạn cần check-in trước khi check-out!', 404);
    }

    await log.update(
      {
        checkOutTime: getCurrentTimeString(),
      },
      { transaction: t },
    );

    await t.commit();
    return successResponse(res, 200, 'Check-out thành công!', { workLog: log });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});
