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
  getMyWorkoutSummary,
} from "../controllers/workoutLog.controller.js";

const router = express.Router();

// POST /workout-logs — check in a member (staff / PT)
router.post(
  "/",
  verifyToken,
  restrictTo("owner", "manager", "pt"),
  validate(createWorkoutLogSchema),
  checkInMember
);

// GET /workout-logs/me — lịch sử buổi tập (member)
router.get(
  "/me",
  verifyToken,
  restrictTo("member"),
  getMyWorkoutLogs
);

// GET /workout-logs/summary — tổng quan lịch sử (member)
router.get(
  "/summary",
  verifyToken,
  restrictTo("member"),
  getMyWorkoutSummary
);

export default router;