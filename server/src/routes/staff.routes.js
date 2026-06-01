import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import { createStaffSchema } from '../validations/staff.validation.js';
import { createStaff, getStaffs } from '../controllers/staff.controller.js';

const router = express.Router();

router.post('/', verifyToken, restrictTo('owner'), validate(createStaffSchema), createStaff);
router.get('/', verifyToken, restrictTo('owner'), getStaffs);

export default router;
