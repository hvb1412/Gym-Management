import express from 'express';
import { getReportStats } from '../controllers/report.controller.js';

const router = express.Router();

// GET /api/v1/reports/stats
router.get('/stats', getReportStats);

export default router;
