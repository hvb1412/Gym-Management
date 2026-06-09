import express from "express";

import {
  verifyToken,
  restrictTo,
} from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.middleware.js";

import {
  createWorkoutLogSchema,
} from "../validations/workoutLog.validation.js";

import {
  checkInMember,
  getMyWorkoutLogs,
} from "../controllers/workoutLog.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  restrictTo(
    "owner",
    "manager",
    "pt"
  ),
  validate(
    createWorkoutLogSchema
  ),
  checkInMember
);

router.get(
  "/me",
  verifyToken,
  restrictTo("member"),
  getMyWorkoutLogs
);

export default router;