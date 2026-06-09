import express from 'express';
import authRoute from './auth.routes.js';
import staffRoute from './staff.routes.js';
import equipmentReportRoute from './equipmentReport.routes.js';
import subscriptionPackageRoute from './subscriptionPackage.routes.js';
import staffWorkLogRoute from './staffWorkLog.routes.js';
import memberRoute from './member.routes.js';
import subscriptionRoute from './subscription.routes.js';
import feedbackRoutes from './feedback.routes.js';
import workoutLogRoutes from './workoutLog.routes.js';
import roomRoute from './room.routes.js';
import equipmentRoutes from './equipment.routes.js';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/staffs', staffRoute);
router.use('/equipment-reports', equipmentReportRoute);
router.use('/packages', subscriptionPackageRoute);
router.use('/work-logs', staffWorkLogRoute);
router.use('/members', memberRoute);
router.use('/subscriptions', subscriptionRoute);
router.use('/feedbacks', feedbackRoutes);
router.use('/workout-logs', workoutLogRoutes);
router.use('/rooms', roomRoute);
router.use('/', equipmentRoutes);

router.use("/", equipmentRoutes);

export default router;