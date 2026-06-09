import express from 'express';
import authRoute from './auth.routes.js';
import staffRoute from './staff.routes.js';
import equipmentReportRoute from './equipmentReport.routes.js';
import subscriptionPackageRoute from './subscriptionPackage.routes.js';
import staffWorkLogRoute from './staffWorkLog.routes.js';
import memberRoute from './member.routes.js';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/staffs', staffRoute);
router.use('/equipment-reports', equipmentReportRoute);
router.use('/packages', subscriptionPackageRoute);
router.use('/work-logs', staffWorkLogRoute);
router.use('/members', memberRoute);


export default router;