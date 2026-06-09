import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

import {
  Member,
  Staff,
  WorkoutLog,
  SubscriptionPlan,
} from "../models/index.js";

export const checkInMember = catchAsync(
  async (req, res, next) => {
    const { memberId } = req.body;

    const member = await Member.findByPk(memberId);

    if (!member) {
      return next(
        new AppError(
          "Không tìm thấy hội viên",
          404
        )
      );
    }

    const activePlan =
      await SubscriptionPlan.findOne({
        where: {
          memberId,
          status: "active",
        },
      });

    if (!activePlan) {
      return next(
        new AppError(
          "Hội viên không có gói tập đang hoạt động",
          403
        )
      );
    }

    const today = new Date();

    if (
      member.expireDate &&
      new Date(member.expireDate) < today
    ) {
      return next(
        new AppError(
          "Gói tập đã hết hạn",
          403
        )
      );
    }

    if (member.remainingWorkout <= 0) {
      return next(
        new AppError(
          "Không còn buổi tập",
          403
        )
      );
    }

    member.remainingWorkout -= 1;

    await member.save();

    const staff = await Staff.findOne({
      where: {
        accountId: req.user.accountId,
      },
    });

    const log = await WorkoutLog.create({
      memberId,
      recorderId: staff.staffId,
      workoutDate: new Date(),
      startTime: new Date()
        .toTimeString()
        .split(" ")[0],
    });

    res.status(201).json({
      success: true,
      message: "Điểm danh thành công",
      data: log,
    });
  }
);

export const getMyWorkoutLogs =
  catchAsync(
    async (req, res, next) => {
      const member =
        await Member.findOne({
          where: {
            accountId:
              req.user.accountId,
          },
        });

      if (!member) {
        return next(
          new AppError(
            "Không tìm thấy hội viên",
            404
          )
        );
      }

      const logs =
        await WorkoutLog.findAll({
          where: {
            memberId:
              member.memberId,
          },

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