import express from "express";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    getAllFeedbacks,
    createFeedback,
    answerFeedback,
    deleteFeedback,
    getFeedbackStats,
    getReportStats
} from "../controllers/feedback.controller.js";

const router = express.Router();

/* List all feedbacks (owner/staff) */
router.get(
    "/",
    verifyToken,
    getAllFeedbacks
);

/* Feedback stats summary */
router.get(
    "/stats",
    verifyToken,
    getFeedbackStats
);

/* Report stats (revenue, members, packages) */
router.get(
    "/report-stats",
    verifyToken,
    getReportStats
);

/* Member creates a feedback */
router.post(
    "/",
    verifyToken,
    createFeedback
);

/* Owner/staff replies to feedback */
router.put(
    "/:id/answer",
    verifyToken,
    answerFeedback
);

/* Delete a feedback */
router.delete(
    "/:id",
    verifyToken,
    deleteFeedback
);

export default router;