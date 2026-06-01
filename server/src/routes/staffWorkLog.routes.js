import express from 'express';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import { checkIn, checkOut } from '../controllers/staffWorkLog.controller.js';

const router = express.Router();

router.post('/check-in', verifyToken, restrictTo('manager', 'pt'), checkIn);
router.put('/check-out', verifyToken, restrictTo('manager', 'pt'), checkOut);

export default router;
