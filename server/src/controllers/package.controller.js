import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { SubscriptionPackage } from "../models/index.js";

export const getAllPackages = catchAsync(async (req, res, next) => {
    const packages = await SubscriptionPackage.findAll({
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: packages.length,
        data: packages
    });
});

export const createPackage = catchAsync(async (req, res, next) => {
    const newPackage = await SubscriptionPackage.create(req.body);

    res.status(201).json({
        success: true,
        data: newPackage
    });
});

export const updatePackage = catchAsync(async (req, res, next) => {
    const pkg = await SubscriptionPackage.findByPk(req.params.id);

    if (!pkg) {
        return next(new AppError("Không tìm thấy gói tập với ID này", 404));
    }

    const updatedPackage = await pkg.update(req.body);

    res.status(200).json({
        success: true,
        data: updatedPackage
    });
});

export const deletePackage = catchAsync(async (req, res, next) => {
    const pkg = await SubscriptionPackage.findByPk(req.params.id);

    if (!pkg) {
        return next(new AppError("Không tìm thấy gói tập với ID này", 404));
    }

    await pkg.destroy();

    res.status(200).json({
        success: true,
        data: {}
    });
});
