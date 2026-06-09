import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

import {
    Member,
    SubscriptionPlan,
    SubscriptionPackage,
    Bill
} from "../models/index.js";

export const getMySubscriptions = catchAsync(
    async (req, res, next) => {

        const accountId = req.user.accountId;

        const member = await Member.findOne({
            where: {
                accountId
            }
        });

        if (!member) {
            return next(
                new AppError(
                    "Không tìm thấy hội viên",
                    404
                )
            );
        }

        const subscriptions =
            await SubscriptionPlan.findAll({
                where: {
                    memberId: member.memberId
                },

                include: [
                    {
                        model: SubscriptionPackage
                    },
                    {
                        model: Bill
                    }
                ],

                order: [
                    ["createdAt", "DESC"]
                ]
            });

        const today = new Date();

        const result =
            subscriptions.map((plan) => {

                const data = plan.toJSON();

                const expireDate =
                    member.expireDate
                        ? new Date(member.expireDate)
                        : null;

                const isExpired =
                    expireDate &&
                    expireDate < today;

                const isActive =
                    data.status === "active" &&
                    !isExpired;

                return {
                    ...data,
                    expireDate:
                        member.expireDate,

                    isActive,
                    isExpired
                };
            });

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    }
);