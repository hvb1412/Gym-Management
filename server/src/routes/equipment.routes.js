import express from "express";

import {
    createEquipmentType,
    createEquipment,
    getEquipments,
} from "../controllers/equipment.controller.js";

import {
    verifyToken,
    restrictTo,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * POST /api/equipment-types
 */
router.post(
    "/equipment-types",
    verifyToken,
    restrictTo("owner"),
    createEquipmentType
);

/**
 * POST /api/equipments
 */
router.post(
    "/equipments",
    verifyToken,
    restrictTo("owner"),
    createEquipment
);

/**
 * GET /api/equipments
 */
router.get(
    "/equipments",
    verifyToken,
    getEquipments
);

export default router;