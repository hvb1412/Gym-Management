import express from 'express';
import authRoute from './auth.routes.js';
import subscriptionRoutes from "./subscription.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import staffRoutes from "./staff.routes.js";
import packageRoutes from "./package.routes.js";
import roomRoutes from "./room.routes.js";
import equipmentTypeRoutes from "./equipmentType.routes.js";
import equipmentRoutes from "./equipment.routes.js";
import equipmentReportRoutes from "./equipmentReport.routes.js";
import staffWorkLogRoutes from "./staffWorkLog.routes.js";

const router = express.Router();

router.use('/auth', authRoute);
router.use("/subscriptions", subscriptionRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/staffs", staffRoutes);
router.use("/packages", packageRoutes);
router.use("/rooms", roomRoutes);
router.use("/equipment-types", equipmentTypeRoutes);
router.use("/equipments", equipmentRoutes);
router.use("/equipment-reports", equipmentReportRoutes);
router.use("/staff-work-logs", staffWorkLogRoutes);

export default router;