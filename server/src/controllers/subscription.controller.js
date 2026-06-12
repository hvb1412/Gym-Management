import {
  sequelize,
  Member,
  SubscriptionPackage,
  SubscriptionPlan,
  Bill,
  Account,
  Staff,
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

const calculateExpireDate = (packageType, durationUnit, duration, numberOfWorkout) => {
  const today = new Date(getTodayDateString());

  if (packageType === 'session') {
    today.setDate(today.getDate() + (numberOfWorkout || 365));
    return today.toISOString().split('T')[0];
  }

  const unit = (durationUnit || '').toLowerCase();

  if (unit === 'ngày' || unit === 'day' || unit === 'daily') {
    today.setDate(today.getDate() + (duration || 1));
  } else if (unit === 'tuần' || unit === 'week') {
    today.setDate(today.getDate() + (duration || 1) * 7);
  } else if (unit === 'tháng' || unit === 'month' || unit === 'monthly') {
    today.setMonth(today.getMonth() + (duration || 1));
  } else if (unit === 'năm' || unit === 'year' || unit === 'yearly') {
    today.setFullYear(today.getFullYear() + (duration || 1));
  } else {
    today.setMonth(today.getMonth() + (duration || 1));
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
  const { memberId, packageId, trainerId } = req.body;

  const member = await Member.findByPk(memberId);
  if (!member) {
    return next(new AppError('Hội viên không tồn tại!', 404));
  }

  const pkg = await SubscriptionPackage.findByPk(packageId);
  if (!pkg || !pkg.isActive) {
    return next(new AppError('Gói tập không tồn tại hoặc đã bị vô hiệu hóa!', 404));
  }

  const startDate = getTodayDateString();
  const expireDate = calculateExpireDate(pkg.packageType, pkg.durationUnit, pkg.duration, pkg.numberOfWorkout);
  const remainingSessions = pkg.packageType === 'session' ? pkg.numberOfWorkout : 0;

  const plan = await SubscriptionPlan.create({
    memberId,
    packageId,
    startDate,
    expireDate,
    remainingSessions,
    status: 'pending_payment',
    trainerId: trainerId || null,
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
      trainerId: plan.trainerId,
    },
  });
});

export const getMyStudents = catchAsync(async (req, res, next) => {
  const accountId = req.user.accountId;
  const { search } = req.query;

  // Lấy staffId của trainer đang đăng nhập
  const staff = await Staff.findOne({ where: { accountId } });
  if (!staff) {
    return next(new AppError('Không tìm thấy thông tin huấn luyện viên!', 404));
  }

  // Tìm tất cả planId mà trainer này phụ trách
  const plans = await SubscriptionPlan.findAll({
    where: { trainerId: staff.staffId },
    attributes: ['memberId'],
    raw: true,
  });

  const memberIds = [...new Set(plans.map((p) => p.memberId))];

  if (memberIds.length === 0) {
    return successResponse(res, 200, 'Lấy danh sách học viên thành công!', { members: [] });
  }

  const { Op } = await import('sequelize');
  const where = { memberId: { [Op.in]: memberIds } };
  if (search) {
    where[Op.and] = [
      { memberId: { [Op.in]: memberIds } },
      {
        [Op.or]: [
          { phoneNumber: { [Op.iLike]: `%${search}%` } },
          { memberName: { [Op.iLike]: `%${search}%` } },
        ],
      },
    ];
    delete where.memberId;
  }

  const members = await Member.findAll({
    where,
    include: [
      { model: Account, attributes: ['accountId', 'email'] },
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
      .filter((p) => p.status === 'active' && p.trainerId === staff.staffId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
    plain.activePlan = activePlan;
    return plain;
  });

  return successResponse(res, 200, 'Lấy danh sách học viên thành công!', { members: result });
});

// Thống kê dashboard cho Huấn luyện viên
export const getTrainerDashboardStats = catchAsync(async (req, res, next) => {
  const accountId = req.user.accountId;

  const staff = await Staff.findOne({ where: { accountId } });
  if (!staff) {
    return next(new AppError('Không tìm thấy thông tin huấn luyện viên!', 404));
  }

  const { Op } = await import('sequelize');

  // Lấy tất cả plans mà trainer này phụ trách
  const plans = await SubscriptionPlan.findAll({
    where: { trainerId: staff.staffId },
    include: [
      {
        model: SubscriptionPackage,
        attributes: ['packageType', 'duration', 'durationUnit', 'numberOfWorkout'],
      },
    ],
  });

  // Tính toán số học viên unique
  const memberIds = [...new Set(plans.map((p) => p.memberId))];
  const totalStudents = memberIds.length;

  // Phân loại từng plan theo trạng thái
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const in14Days = new Date(today);
  in14Days.setDate(in14Days.getDate() + 14);

  // Tính ngày hết hạn cho một plan
  const calcExpire = (plan) => {
    const pkg = plan.SubscriptionPackage;
    if (!plan.startDate) return plan.expireDate ? new Date(plan.expireDate) : null;

    const start = new Date(plan.startDate);
    if (pkg?.packageType === 'session' && pkg?.numberOfWorkout) {
      start.setDate(start.getDate() + pkg.numberOfWorkout);
      return start;
    }
    if (pkg?.duration) {
      const unit = (pkg.durationUnit || '').toLowerCase();
      if (unit === 'ngày' || unit === 'day' || unit === 'days') start.setDate(start.getDate() + pkg.duration);
      else if (unit === 'tuần' || unit === 'week' || unit === 'weeks') start.setDate(start.getDate() + pkg.duration * 7);
      else if (unit === 'năm' || unit === 'year' || unit === 'years') start.setFullYear(start.getFullYear() + pkg.duration);
      else start.setMonth(start.getMonth() + pkg.duration);
      return start;
    }
    return plan.expireDate ? new Date(plan.expireDate) : null;
  };

  // Xác định trạng thái cho mỗi member dựa trên plan tốt nhất
  // Group plans by memberId, lấy plan active mới nhất cho mỗi member
  const memberStatusMap = {};
  for (const plan of plans) {
    if (plan.status !== 'active') continue;
    const mid = plan.memberId;
    if (!memberStatusMap[mid]) {
      memberStatusMap[mid] = plan;
    } else {
      // Lấy plan mới nhất
      if (new Date(plan.createdAt) > new Date(memberStatusMap[mid].createdAt)) {
        memberStatusMap[mid] = plan;
      }
    }
  }

  let activeStudents = 0;
  let expiringSoon = 0;
  let expiredStudents = 0;

  for (const mid of memberIds) {
    const plan = memberStatusMap[mid];
    if (!plan) {
      expiredStudents++;
      continue;
    }
    const expire = calcExpire(plan);
    if (!expire) {
      activeStudents++;
      continue;
    }

    const expireNorm = new Date(expire);
    expireNorm.setHours(0, 0, 0, 0);

    if (expireNorm < today) {
      expiredStudents++;
    } else if (expireNorm <= in14Days) {
      expiringSoon++;
    } else {
      activeStudents++;
    }
  }

  return successResponse(res, 200, 'Lấy thống kê dashboard thành công!', {
    totalStudents,
    activeStudents,
    expiringSoon,
    expiredStudents,
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
  const role = req.user.role;
  const { packageId, paymentMethod, memberId } = req.body;

  let member;
  if (memberId && ['manager', 'owner', 'pt'].includes(role)) {
    member = await Member.findByPk(memberId);
  } else {
    member = await Member.findOne({ where: { accountId } });
  }

  if (!member) {
    return next(new AppError('Không tìm thấy thông tin hội viên!', 404));
  }

  const pkg = await SubscriptionPackage.findByPk(packageId);
  if (!pkg || !pkg.isActive) {
    return next(new AppError('Gói tập không tồn tại hoặc đã bị vô hiệu hóa!', 404));
  }

  const startDate = getTodayDateString();
  const expireDate = calculateExpireDate(pkg.packageType, pkg.durationUnit, pkg.duration, pkg.numberOfWorkout);
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
