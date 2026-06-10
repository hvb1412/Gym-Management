import express from "express";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    createFeedback,
    answerFeedback,
    getMemberFeedbacks,
    getAllFeedbacks,
    deleteFeedback
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.get(
    "/me",
    verifyToken,
    getMemberFeedbacks
);

router.get(
    "/",
    verifyToken,
    getAllFeedbacks
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


export default router;