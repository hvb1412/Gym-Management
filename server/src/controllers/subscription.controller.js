import {
  sequelize,
  Member,
  SubscriptionPackage,
  SubscriptionPlan,
  Bill,
} from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.js';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const getTodayDateString = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

const calculateExpireDate = (packageType, duration) => {
  const today = new Date(getTodayDateString());

  if (packageType === 'daily' || packageType === 'day') {
    today.setDate(today.getDate() + (duration || 1));
  } else if (packageType === 'monthly' || packageType === 'month') {
    today.setMonth(today.getMonth() + (duration || 1));
  } else if (packageType === 'yearly' || packageType === 'year') {
    today.setFullYear(today.getFullYear() + (duration || 1));
  }

  return today.toISOString().split('T')[0];
};

export const getMySubscriptions = catchAsync(async (req, res, next) => {
  const accountId = req.user.accountId;
  const member = await Member.findOne({ where: { accountId } });

  if (!member) {
    return next(new AppError('Không tìm thấy thông tin hội viên!', 404));
  }

  const plans = await SubscriptionPlan.findAll({
    where: { memberId: member.memberId },
    include: [SubscriptionPackage, Bill],
  });

  return successResponse(res, 200, 'Lấy danh sách gói tập của tôi thành công!', {
    subscriptions: plans,
  });
});

export const createSubscription = catchAsync(async (req, res, next) => {
  const { memberId, packageId } = req.body;

  const member = await Member.findByPk(memberId);
  if (!member) {
    return next(new AppError('Hội viên không tồn tại!', 404));
  }

  const pkg = await SubscriptionPackage.findByPk(packageId);
  if (!pkg || !pkg.isActive) {
    return next(new AppError('Gói tập không tồn tại hoặc đã bị vô hiệu hóa!', 404));
  }

  const startDate = getTodayDateString();
  const expireDate = calculateExpireDate(pkg.packageType, pkg.duration);
  const remainingSessions = pkg.packageType === 'session' ? pkg.numberOfWorkout : 0;

  const plan = await SubscriptionPlan.create({
    memberId,
    packageId,
    startDate,
    expireDate,
    remainingSessions,
    status: 'pending_payment',
  });

  return successResponse(res, 201, 'Tạo đăng ký gói tập thành công!', {
    subscription: {
      planId: plan.planId,
      memberId: plan.memberId,
      packageId: plan.packageId,
      startDate: plan.startDate,
      expireDate: plan.expireDate,
      remainingSessions: plan.remainingSessions,
      status: plan.status,
    },
  });
});

export const processSubscriptionPayment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;

  const t = await sequelize.transaction();

  try {
    const plan = await SubscriptionPlan.findByPk(id, {
      include: [SubscriptionPackage],
      transaction: t,
    });

    if (!plan) {
      throw new AppError('Gói tập đã đăng ký không tồn tại!', 404);
    }

    if (plan.status !== 'pending_payment') {
      throw new AppError('Gói tập này đã được thanh toán hoặc không ở trạng thái chờ thanh toán!', 400);
    }

    if (plan.billId) {
      throw new AppError('Gói tập này đã được thanh toán trước đó (đã có hóa đơn)!', 400);
    }

    const amount = plan.SubscriptionPackage.price;

    const bill = await Bill.create(
      {
        amount,
        paymentMethod,
        paymentDate: new Date(),
      },
      { transaction: t },
    );

    await plan.update(
      {
        billId: bill.billId,
        status: 'active',
      },
      { transaction: t },
    );

    await t.commit();

    return successResponse(res, 200, 'Thanh toán và kích hoạt gói tập thành công!', {
      subscription: {
        planId: plan.planId,
        billId: bill.billId,
        amount: bill.amount,
        paymentMethod: bill.paymentMethod,
        paymentDate: bill.paymentDate,
        status: 'active',
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});

export const renewSubscription = catchAsync(async (req, res, next) => {
  const accountId = req.user.accountId;
  const { packageId, paymentMethod } = req.body;

  const member = await Member.findOne({ where: { accountId } });
  if (!member) {
    return next(new AppError('Không tìm thấy thông tin hội viên!', 404));
  }

  const pkg = await SubscriptionPackage.findByPk(packageId);
  if (!pkg || !pkg.isActive) {
    return next(new AppError('Gói tập không tồn tại hoặc đã bị vô hiệu hóa!', 404));
  }

  const startDate = getTodayDateString();
  const expireDate = calculateExpireDate(pkg.packageType, pkg.duration);
  const remainingSessions = pkg.packageType === 'session' ? pkg.numberOfWorkout : 0;
  const amount = pkg.price;

  const t = await sequelize.transaction();

  try {
    const bill = await Bill.create(
      {
        amount,
        paymentMethod,
        paymentDate: new Date(),
      },
      { transaction: t }
    );

    const plan = await SubscriptionPlan.create(
      {
        memberId: member.memberId,
        packageId,
        startDate,
        expireDate,
        remainingSessions,
        status: 'active',
        billId: bill.billId,
      },
      { transaction: t }
    );

    await t.commit();

    return successResponse(res, 200, 'Gia hạn gói tập thành công!', {
      subscription: {
        planId: plan.planId,
        packageId: plan.packageId,
        startDate: plan.startDate,
        expireDate: plan.expireDate,
        status: plan.status,
        billId: bill.billId,
      },
    });
  } catch (error) {
    await t.rollback();
    return next(error);
  }
});
