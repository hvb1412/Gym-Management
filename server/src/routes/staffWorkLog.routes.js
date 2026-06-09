import express from 'express';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import { checkIn, checkOut, getTodayLogs } from '../controllers/staffWorkLog.controller.js';

const router = express.Router();

router.get('/today', verifyToken, restrictTo('owner', 'manager'), getTodayLogs);
router.post('/check-in', verifyToken, restrictTo('owner', 'manager', 'pt'), checkIn);
router.put('/check-out', verifyToken, restrictTo('owner', 'manager', 'pt'), checkOut);

export default router;
