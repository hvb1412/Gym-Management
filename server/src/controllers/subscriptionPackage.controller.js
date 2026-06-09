import { SubscriptionPackage } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.js';

export const createPackage = catchAsync(async (req, res, next) => {
  const {
    packageName,
    packageType,
    price,
    isPtIncluded,
    isVip,
    numberOfWorkouts,
    isActive,
  } = req.body;

  // Defensive check (Joi đã kiểm tra, nhưng giữ để an toàn)
  if (packageType === 'session' && (!numberOfWorkouts || numberOfWorkouts <= 0)) {
    return next(new AppError('Gói theo buổi cần numberOfWorkouts > 0', 400));
  }

  const created = await SubscriptionPackage.create({
    packageName,
    packageType,
    price,
    trainerIncluded: isPtIncluded,
    vipIncluded: isVip,
    numberOfWorkout: numberOfWorkouts ?? null,
    isActive,
  });

  return successResponse(res, 201, 'Tạo gói tập thành công!', { package: created });
});

export const getActivePackages = catchAsync(async (req, res) => {
  const packages = await SubscriptionPackage.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']],
  });

  return successResponse(res, 200, 'Lấy danh sách gói tập thành công!', {
    packages,
  });
});
