import {
    Equipment,
    EquipmentType,
    Room,
} from "../models/index.js";

import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { successResponse } from "../utils/response.js";

/**
 * POST /api/equipment-types
 */
export const createEquipmentType = catchAsync(
    async (req, res, next) => {
        const {
            equipmentName,
            origin,
            warrantyDuration,
        } = req.body;

        if (!equipmentName) {
            return next(
                new AppError(
                    "Tên loại thiết bị là bắt buộc",
                    400
                )
            );
        }

        const type =
            await EquipmentType.create({
                equipmentName,
                origin,
                warrantyDuration,
            });

        successResponse(
            res,
            201,
            "Tạo loại thiết bị thành công",
            type
        );
    }
);

/**
 * POST /api/equipments
 */
export const createEquipment = catchAsync(
    async (req, res, next) => {
        const {
            roomId,
            typeId,
            usageStatus,
            importDate,
        } = req.body;

        const room =
            await Room.findByPk(roomId);

        if (!room) {
            return next(
                new AppError(
                    "roomId không tồn tại",
                    400
                )
            );
        }

        const equipmentType =
            await EquipmentType.findByPk(
                typeId
            );

        if (!equipmentType) {
            return next(
                new AppError(
                    "typeId không tồn tại",
                    400
                )
            );
        }

        const equipment =
            await Equipment.create({
                roomId,
                typeId,
                usageStatus,
                importDate,
            });

        successResponse(
            res,
            201,
            "Tạo thiết bị thành công",
            equipment
        );
    }
);

/**
 * GET /api/equipments
 */
export const getEquipments =
    catchAsync(async (req, res) => {
        const equipments =
            await Equipment.findAll({
                include: [
                    {
                        model: Room,
                        attributes: [
                            "roomId",
                            "roomName",
                        ],
                    },
                    {
                        model: EquipmentType,
                        attributes: [
                            "typeId",
                            "equipmentName",
                        ],
                    },
                ],
                order: [
                    ["createdAt", "DESC"],
                ],
            });

        successResponse(
            res,
            200,
            "Lấy danh sách thiết bị thành công",
            equipments
        );
    });