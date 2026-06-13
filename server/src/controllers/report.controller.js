import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync.js';
import { successResponse } from '../utils/response.js';
import { Bill, Member, SubscriptionPlan, SubscriptionPackage, WorkoutLog, EquipmentReport, Feedback } from '../models/index.js';

export const getDashboardStats = catchAsync(async (req, res, next) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayStr = startOfDay.toISOString().split('T')[0];

  const checkInCount = await WorkoutLog.count({
    where: {
      workoutDate: todayStr
    }
  });

  const todayBills = await Bill.findAll({
    where: {
      createdAt: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay
      }
    }
  });
  const todayRevenue = todayBills.reduce((acc, bill) => acc + Number(bill.amount), 0);

  let todayRevenueStr = "0";
  if (todayRevenue > 0) {
    if (todayRevenue >= 1000000) {
      todayRevenueStr = `${(todayRevenue / 1000000).toFixed(1).replace(/\\.0$/, '')} tr`;
    } else if (todayRevenue >= 1000) {
      todayRevenueStr = `${(todayRevenue / 1000).toFixed(0)} k`;
    } else {
      todayRevenueStr = todayRevenue.toString();
    }
  }

  const openMaintenanceCount = await EquipmentReport.count({
    where: {
      status: {
        [Op.in]: ['pending', 'processing']
      }
    }
  });

  const pendingFeedbackCount = await Feedback.count({
    where: {
      answerContent: null
    }
  });

  return successResponse(res, 200, "Lấy dữ liệu dashboard thành công", {
    checkInCount,
    todayRevenue: todayRevenueStr,
    openMaintenanceCount,
    pendingFeedbackCount
  });
});

export const getReportStats = catchAsync(async (req, res, next) => {
  const now = new Date();

  // 1. Tạo mảng 6 tháng gần nhất (VD: '5/2026', '6/2026')
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      label: `${d.getMonth() + 1}/${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1
    });
  }

  const sixMonthsAgoDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // --------------------------------------------------------
  // A. THỐNG KÊ DOANH THU
  // --------------------------------------------------------
  const allBills = await Bill.findAll();

  let totalRevenue = 0;
  const revenueByMonthMap = {};
  last6Months.forEach(m => { revenueByMonthMap[m.label] = 0; });

  allBills.forEach(bill => {
    const amt = Number(bill.amount);

    const d = new Date(bill.createdAt);
    if (d >= sixMonthsAgoDate) {
      totalRevenue += amt;
      const label = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (revenueByMonthMap[label] !== undefined) {
        revenueByMonthMap[label] += amt;
      }
    }
  });

  // Chuyển đổi doanh thu sang đơn vị triệu VND cho biểu đồ
  const revenueByMonth = last6Months.map(m => ({
    m: m.label,
    v: parseFloat((revenueByMonthMap[m.label] / 1000000).toFixed(1))
  }));

  // Lấy 10 giao dịch gần nhất
  const recentBills = await Bill.findAll({
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [{
      model: SubscriptionPlan,
      include: [
        { model: Member, attributes: ['memberName'] },
        { model: SubscriptionPackage, attributes: ['packageName'] }
      ]
    }]
  });

  const transactions = recentBills.map(bill => {
    const plan = (bill.SubscriptionPlans && bill.SubscriptionPlans.length > 0) ? bill.SubscriptionPlans[0] : null;
    const memberName = plan?.Member?.memberName || 'Khách vãng lai';
    const pkgName = plan?.SubscriptionPackage?.packageName || 'Không xác định';

    return {
      member: memberName,
      pkg: pkgName,
      amount: Number(bill.amount),
      method: bill.paymentMethod === 'Tiền mặt' ? 'cash' : (bill.paymentMethod === 'Chuyển khoản' ? 'transfer' : 'cash'),
      date: (() => { const d = new Date(bill.createdAt); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; })()
    };
  });

  // --------------------------------------------------------
  // B. THỐNG KÊ HỘI VIÊN
  // --------------------------------------------------------
  const allMembers = await Member.findAll();
  let totalMembers = allMembers.length;
  let newThisMonth = 0;

  const currentMonthLabel = `${now.getMonth() + 1}/${now.getFullYear()}`;

  const membersByMonthMap = {};
  last6Months.forEach(m => { membersByMonthMap[m.label] = 0; });

  allMembers.forEach(member => {
    const d = new Date(member.createdAt);
    const label = `${d.getMonth() + 1}/${d.getFullYear()}`;

    if (label === currentMonthLabel) newThisMonth++;

    if (d >= sixMonthsAgoDate && membersByMonthMap[label] !== undefined) {
      membersByMonthMap[label]++;
    }
  });

  const membersByMonth = last6Months.map(m => ({
    m: m.label,
    v: membersByMonthMap[m.label]
  }));

  // Breakdown phân bổ gói tập
  const activePlans = await SubscriptionPlan.findAll({
    where: { status: 'active' },
    include: [{ model: SubscriptionPackage, attributes: ['packageName'] }]
  });

  const pkgCount = {};
  activePlans.forEach(plan => {
    const pkgName = plan.SubscriptionPackage?.packageName || 'Khác';
    pkgCount[pkgName] = (pkgCount[pkgName] || 0) + 1;
  });

  let totalActivePlans = activePlans.length;
  const pkgBreakdown = Object.keys(pkgCount).map(name => ({
    name,
    value: totalActivePlans > 0 ? Math.round((pkgCount[name] / totalActivePlans) * 100) : 0
  })).sort((a, b) => b.value - a.value); // Xếp theo % giảm dần

  // --------------------------------------------------------
  // Trả về JSON theo đúng chuẩn Frontend mong đợi
  // --------------------------------------------------------
  return successResponse(res, 200, "Lấy dữ liệu thống kê thành công", {
    revenue: {
      total: totalRevenue,
      byMonth: revenueByMonth,
      transactions: transactions
    },
    members: {
      total: totalMembers,
      newThisMonth: newThisMonth,
      byMonth: membersByMonth,
      pkgBreakdown: pkgBreakdown
    }
  });
});
