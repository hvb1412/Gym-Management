import express from 'express';
import authRoute from './auth.routes.js';
import subscriptionRoutes from "./subscription.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import workoutLogRoutes from "./workoutLog.routes.js";

const router = express.Router();

router.use('/auth', authRoute);
router.use("/subscriptions", subscriptionRoutes);
router.use( "/feedbacks", feedbackRoutes);
router.use("/workout-logs",workoutLogRoutes);


export default router;