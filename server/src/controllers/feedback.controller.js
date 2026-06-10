import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { Op } from "sequelize";

import {
    Member,
    Staff,
    Feedback,
    Account,
    Bill,
    SubscriptionPlan,
    SubscriptionPackage
} from "../models/index.js";

export const getMemberFeedbacks = catchAsync(
    async (req, res, next) => {
        const accountId = req.user.accountId;
        
        const member = await Member.findOne({
            where: { accountId }
        });

        if (!member) {
            return next(new AppError("Member not found", 404));
        }

        const feedbacks = await Feedback.findAll({
            where: { memberId: member.memberId },
            order: [["feedbackDate", "DESC"], ["createdAt", "DESC"]]
        });

        res.status(200).json({
            success: true,
            data: feedbacks
        });
    }
);

export const deleteFeedback = catchAsync(
    async (req, res, next) => {
        const { id } = req.params;
        const accountId = req.user.accountId;

        const member = await Member.findOne({
            where: { accountId }
        });

        if (!member) {
            return next(new AppError("Member not found", 404));
        }

        const feedback = await Feedback.findOne({
            where: {
                feedbackId: id,
                memberId: member.memberId
            }
        });

        if (!feedback) {
            return next(new AppError("Feedback not found or you don't have permission to delete it", 404));
        }

        await feedback.destroy();

        res.status(200).json({
            success: true,
            message: "Feedback deleted successfully"
        });
    }
);

export const createFeedback = catchAsync(
    async (req, res, next) => {
        const { feedbackType, feedbackContent } = req.body;
        const accountId = req.user.accountId;

        const member = await Member.findOne({
            where: { accountId }
        });

        if (!member) {
            return next(new AppError("Member not found", 404));
        }

        const feedback = await Feedback.create({
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

/* PUT /feedbacks/:id/answer — staff/owner replies */
export const answerFeedback = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { answerContent } = req.body;
    const accountId = req.user.accountId;

    const staff = await Staff.findOne({ where: { accountId } });

    if (!staff) {
        return next(new AppError("Staff not found", 404));
    }

    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
        return next(new AppError("Feedback not found", 404));
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
});


/* GET /feedbacks/stats — dashboard summary for owner */
export const getFeedbackStats = catchAsync(async (req, res, next) => {
    const total = await Feedback.count();
    const pending = await Feedback.count({ where: { answerContent: null } });
    const answered = total - pending;

    const byType = await Feedback.findAll({
        attributes: [
            "feedbackType",
            [Feedback.sequelize.fn("COUNT", Feedback.sequelize.col("feedback_id")), "count"]
        ],
        group: ["feedbackType"]
    });

    res.status(200).json({
        success: true,
        data: { total, pending, answered, byType }
    });
});

/* GET /reports/stats — aggregate stats for the reports page */
export const getReportStats = catchAsync(async (req, res, next) => {
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Revenue this month (from bills with paymentDate in range)
    const bills = await Bill.findAll({
        where: {
            paymentDate: {
                [Op.between]: [startOfMonth, endOfMonth]
            }
        },
        include: [
            {
                model: SubscriptionPlan,
                include: [
                    {
                        model: Member,
                        attributes: ["memberId", "memberName"]
                    },
                    {
                        model: SubscriptionPackage,
                        attributes: ["packageName", "packageType"]
                    }
                ]
            }
        ]
    });

    const totalRevenue = bills.reduce((s, b) => s + parseFloat(b.amount || 0), 0);

    // Members registered this month
    const newMembers = await Member.count({
        where: {
            createdAt: {
                [Op.between]: [startOfMonth, endOfMonth]
            }
        }
    });

    const totalMembers = await Member.count();

    // Revenue by month for last 6 months
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(targetYear, targetMonth - 1 - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const monthBills = await Bill.findAll({
            where: { paymentDate: { [Op.between]: [start, end] } }
        });
        const rev = monthBills.reduce((s, b) => s + parseFloat(b.amount || 0), 0);
        revenueByMonth.push({
            m: `T${d.getMonth() + 1}`,
            v: Math.round(rev / 1_000_000) // to triệu
        });
    }

    // New members by month for last 6 months
    const membersByMonth = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(targetYear, targetMonth - 1 - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        const cnt = await Member.count({
            where: { createdAt: { [Op.between]: [start, end] } }
        });
        membersByMonth.push({ m: `T${d.getMonth() + 1}`, v: cnt });
    }

    // Package breakdown
    const pkgStats = await SubscriptionPlan.findAll({
        attributes: [
            "packageId",
            [SubscriptionPlan.sequelize.fn("COUNT", SubscriptionPlan.sequelize.col("SubscriptionPlan.plan_id")), "count"]
        ],
        include: [
            {
                model: SubscriptionPackage,
                attributes: ["packageName"]
            }
        ],
        group: ["SubscriptionPlan.packageId", "SubscriptionPackage.package_id"],
        where: { status: "active" }
    });

    const totalActivePlans = pkgStats.reduce((s, p) => s + parseInt(p.dataValues.count || 0), 0);
    const pkgBreakdown = pkgStats.map((p) => ({
        name: p.SubscriptionPackage?.packageName || "Unknown",
        value: totalActivePlans > 0 ? Math.round((parseInt(p.dataValues.count || 0) / totalActivePlans) * 100) : 0
    }));

    res.status(200).json({
        success: true,
        data: {
            revenue: {
                total: totalRevenue,
                byMonth: revenueByMonth,
                transactions: bills.slice(0, 10).map(b => ({
                    member: b.SubscriptionPlan?.Member?.memberName || "Unknown",
                    pkg: b.SubscriptionPlan?.SubscriptionPackage?.packageName || "Unknown",
                    amount: parseFloat(b.amount),
                    method: b.paymentMethod,
                    date: b.paymentDate ? new Date(b.paymentDate).toLocaleDateString("vi-VN") : "N/A"
                }))
            },
            members: {
                total: totalMembers,
                newThisMonth: newMembers,
                byMonth: membersByMonth,
                pkgBreakdown
            }
        }
    });
});