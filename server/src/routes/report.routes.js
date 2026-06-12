import express from 'express';
import { getReportStats, getDashboardStats } from '../controllers/report.controller.js';

const router = express.Router();

// GET /api/v1/reports/dashboard
router.get('/dashboard', getDashboardStats);

// GET /api/v1/reports/stats
router.get('/stats', getReportStats);

export default router;
