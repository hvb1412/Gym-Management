import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import {
  createReportSchema,
  resolveReportSchema,
} from '../validations/equipmentReport.validation.js';
import {
  createEquipmentReport,
  resolveEquipmentReport,
} from '../controllers/equipmentReport.controller.js';

const router = express.Router();

router.post(
  '/',
  verifyToken,
  restrictTo('manager', 'pt', 'owner'),
  validate(createReportSchema),
  createEquipmentReport,
);

router.put(
  '/:id',
  verifyToken,
  restrictTo('owner'),
  validate(resolveReportSchema),
  resolveEquipmentReport,
);

export default router;
