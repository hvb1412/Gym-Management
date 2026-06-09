import express from "express";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    getMySubscriptions
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.get(
    "/me",
    verifyToken,
    getMySubscriptions
);

export default router;