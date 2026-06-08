import express from "express";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    createFeedback,
    answerFeedback
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.post(
    "/",
    verifyToken,
    createFeedback
);

router.put(
    "/:id/answer",
    verifyToken,
    answerFeedback
);

export default router;