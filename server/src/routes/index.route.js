import express from "express";
import authRoute from "./auth.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import workoutLogRoutes from "./workoutLog.routes.js";
import roomRoute from "./room.routes.js";
import equipmentRoutes from "./equipment.routes.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/subscriptions", subscriptionRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/workout-logs", workoutLogRoutes);
router.use("/rooms", roomRoute);

router.use("/", equipmentRoutes);

export default router;