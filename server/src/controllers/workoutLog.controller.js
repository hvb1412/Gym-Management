import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

import {
  Member,
  Staff,
  WorkoutLog,
  SubscriptionPlan,
  SubscriptionPackage,
} from "../models/index.js";

// ── Check-in ──────────────────────────────────────────────
export const checkInMember = catchAsync(
  async (req, res, next) => {
    const { memberId, notes } = req.body;

    const member = await Member.findByPk(memberId);
    if (!member) {
      return next(new AppError("Không tìm thấy hội viên", 404));
    }

    const activePlan = await SubscriptionPlan.findOne({
      where: { memberId, status: "active" },
      include: [{ model: SubscriptionPackage }],
    });

    if (!activePlan) {
      return next(
        new AppError("Hội viên không có gói tập đang hoạt động", 403)
      );
    }

    const today = new Date();
    if (
      member.expireDate &&
      new Date(member.expireDate) < today
    ) {
      return next(new AppError("Gói tập đã hết hạn", 403));
    }

    if (activePlan.SubscriptionPackage?.packageType === "session") {
      if (activePlan.remainingSessions <= 0) {
        return next(new AppError("Không còn buổi tập", 403));
      }
      activePlan.remainingSessions -= 1;
      await activePlan.save();
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const existingLog = await WorkoutLog.findOne({
      where: { memberId, workoutDate: todayStr }
    });
    if (existingLog) {
      return next(new AppError("Hội viên đã check in hôm nay rồi", 400));
    }

    const staff = await Staff.findOne({
      where: { accountId: req.user.accountId },
    });

    const now = new Date();
    const startTimeStr = now.toTimeString().split(" ")[0];

    const log = await WorkoutLog.create({
      memberId,
      recorderId: staff.staffId,
      workoutDate: now,
      startTime: startTimeStr,
      notes: notes || null,
    });

    res.status(201).json({
      success: true,
      message: "Điểm danh thành công",
      data: log,
    });
  }
);

// ── Check-out ─────────────────────────────────────────────
export const checkOutMember = catchAsync(
  async (req, res, next) => {
    const { workoutId } = req.params;

    const log = await WorkoutLog.findByPk(workoutId);
    if (!log) {
      return next(new AppError("Không tìm thấy buổi tập", 404));
    }

    // Commented out to allow multiple check-outs
    // if (log.endTime) {
    //   return next(new AppError("Hội viên đã check out rồi", 400));
    // }

    const now = new Date();
    const endTimeStr = now.toTimeString().split(" ")[0];

    // Calculate duration in minutes
    const [sh, sm, ss] = log.startTime.split(":").map(Number);
    const [eh, em, es] = endTimeStr.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const duration = Math.max(0, endMin - startMin);

    log.endTime = endTimeStr;
    log.duration = duration;
    await log.save();

    res.status(200).json({
      success: true,
      message: "Check out thành công",
      data: log,
    });
  }
);

// ── Get today's log for a specific member (staff/PT use) ──
export const getTodayLogForMember = catchAsync(
  async (req, res, next) => {
    const { memberId } = req.params;

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    const log = await WorkoutLog.findOne({
      where: { memberId, workoutDate: dateStr },
      order: [["startTime", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: log || null,
    });
  }
);

// ── Get my workout logs (member) ──────────────────────────
export const getMyWorkoutLogs = catchAsync(
  async (req, res, next) => {
    const member = await Member.findOne({
      where: { accountId: req.user.accountId },
    });

    if (!member) {
      return next(new AppError("Không tìm thấy hội viên", 404));
    }

    const logs = await WorkoutLog.findAll({
      where: { memberId: member.memberId },
      include: [
        {
          model: Staff,
          as: "Recorder",
          attributes: ["staffId", "staffName", "position"],
        },
      ],
      order: [
        ["workoutDate", "DESC"],
        ["startTime", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  }
);

// ── Get my workout summary (active plan + stats + logs) ───
export const getMyWorkoutSummary = catchAsync(
  async (req, res, next) => {
    const member = await Member.findOne({
      where: { accountId: req.user.accountId },
    });

    if (!member) {
      return next(new AppError("Không tìm thấy hội viên", 404));
    }

    // Active subscription plan (with package + trainer)
    const activePlan = await SubscriptionPlan.findOne({
      where: { memberId: member.memberId, status: "active" },
      include: [
        {
          model: SubscriptionPackage,
          attributes: [
            "packageName",
            "packageType",
            "vipIncluded",
            "trainerIncluded",
            "duration",
            "durationUnit",
            "numberOfWorkout",
          ],
        },
        {
          model: Staff,
          as: "Trainer",
          attributes: ["staffId", "staffName", "position"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // All workout logs
    const logs = await WorkoutLog.findAll({
      where: { memberId: member.memberId },
      include: [
        {
          model: Staff,
          as: "Recorder",
          attributes: ["staffId", "staffName", "position"],
        },
      ],
      order: [
        ["workoutDate", "DESC"],
        ["startTime", "DESC"],
      ],
    });

    // Calculate streak
    const sortedDates = [
      ...new Set(logs.map((l) => l.workoutDate)),
    ].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const d of sortedDates) {
      const logDate = new Date(d);
      logDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round(
        (currentDate - logDate) / 86400000
      );
      if (diffDays <= 1) {
        streak += 1;
        currentDate = logDate;
      } else {
        break;
      }
    }

    // Days remaining
    let daysRemaining = null;
    if (activePlan?.expireDate) {
      const expireDate = new Date(activePlan.expireDate);
      expireDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = expireDate.getTime() - today.getTime();
      daysRemaining = Math.max(
        0,
        Math.round(diff / 86400000)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        member: {
          memberId: member.memberId,
          memberName: member.memberName,
          remainingWorkout: member.remainingWorkout,
        },
        activePlan: activePlan
          ? {
            ...activePlan.toJSON(),
            daysRemaining,
          }
          : null,
        workoutLogs: logs,
        totalSessions: logs.length,
        streak,
      },
    });
  }
);