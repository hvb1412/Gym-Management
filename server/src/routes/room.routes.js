import express from "express";

import {
    createRoom,
    getRooms,
    updateRoom,
} from "../controllers/room.controller.js";

import {
    verifyToken,
    restrictTo,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Owner tạo phòng
 */
router.post(
    "/",
    verifyToken,
    restrictTo("owner"),
    createRoom
);

/**
 * Lấy danh sách phòng
 */
router.get(
    "/",
    verifyToken,
    getRooms
);

/**
 * Owner cập nhật phòng
 */
router.put(
    "/:id",
    verifyToken,
    restrictTo("owner"),
    updateRoom
);

export default router;