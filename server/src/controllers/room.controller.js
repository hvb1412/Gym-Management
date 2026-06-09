import { Room } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { successResponse } from "../utils/response.js";

/**
 * POST /api/rooms
 */
export const createRoom = catchAsync(async (req, res, next) => {
    const { roomName, roomType, operatingStatus } = req.body;

    if (!roomName || roomName.trim() === "") {
        return next(
            new AppError("Tên phòng không được để trống", 400)
        );
    }

    const room = await Room.create({
        roomName,
        roomType,
        operatingStatus
    });

    successResponse(
        res,
        201,
        "Tạo phòng thành công",
        room
    );
});

/**
 * GET /api/rooms
 * Filter:
 * ?roomType=Gym
 * ?operatingStatus=active
 */
export const getRooms = catchAsync(async (req, res) => {
    const { roomType, operatingStatus } = req.query;

    const whereClause = {};

    if (roomType) {
        whereClause.roomType = roomType;
    }

    if (operatingStatus) {
        whereClause.operatingStatus = operatingStatus;
    }

    const rooms = await Room.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
    });

    successResponse(
        res,
        200,
        "Lấy danh sách phòng thành công",
        rooms
    );
});

/**
 * PUT /api/rooms/:id
 */
export const updateRoom = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const room = await Room.findByPk(id);

    if (!room) {
        return next(
            new AppError("Không tìm thấy phòng", 404)
        );
    }

    const {
        roomName,
        roomType,
        operatingStatus,
    } = req.body;

    if (
        roomName !== undefined &&
        roomName.trim() === ""
    ) {
        return next(
            new AppError(
                "Tên phòng không được để trống",
                400
            )
        );
    }

    await room.update({
        roomName:
            roomName ?? room.roomName,

        roomType:
            roomType ?? room.roomType,

        operatingStatus:
            operatingStatus ??
            room.operatingStatus,
    });

    successResponse(
        res,
        200,
        "Cập nhật phòng thành công",
        room
    );
});