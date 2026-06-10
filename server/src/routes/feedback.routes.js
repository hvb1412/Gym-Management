import express from "express";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    getAllFeedbacks,
    createFeedback,
    answerFeedback,
    getMemberFeedbacks,
    deleteFeedback
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.get(
    "/me",
    verifyToken,
    getMemberFeedbacks
);

router.post(
    "/",
    verifyToken,
    createFeedback
);

router.delete(
    "/:id",
    verifyToken,
    deleteFeedback
);

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