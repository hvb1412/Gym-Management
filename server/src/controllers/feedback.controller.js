import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

import {
    Member,
    Staff,
    Feedback
} from "../models/index.js";

export const createFeedback = catchAsync(
    async (req, res, next) => {

        const { feedbackType, feedbackContent } =
            req.body;

        const accountId =
            req.user.accountId;

        const member =
            await Member.findOne({
                where: { accountId }
            });

        if (!member) {
            return next(
                new AppError(
                    "Member not found",
                    404
                )
            );
        }

        const feedback =
            await Feedback.create({
                memberId: member.memberId,
                feedbackType,
                feedbackContent
            });

        res.status(201).json({
            success: true,
            data: feedback
        });
    }
);

export const answerFeedback = catchAsync(
    async (req, res, next) => {

        const { id } = req.params;

        const { answerContent } =
            req.body;

        const accountId =
            req.user.accountId;

        const staff =
            await Staff.findOne({
                where: {
                    accountId
                }
            });

        if (!staff) {
            return next(
                new AppError(
                    "Staff not found",
                    404
                )
            );
        }

        const feedback =
            await Feedback.findByPk(id);

        if (!feedback) {
            return next(
                new AppError(
                    "Feedback not found",
                    404
                )
            );
        }

        await feedback.update({
            answerContent,
            answerDate: new Date(),
            answererId: staff.staffId
        });

        res.status(200).json({
            success: true,
            data: feedback
        });
    }
);