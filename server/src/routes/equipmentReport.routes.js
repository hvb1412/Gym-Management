import express from 'express';
import {
  getEquipmentReports,
  createEquipmentReport,
  updateEquipmentReport,
  deleteEquipmentReport
} from '../controllers/equipmentReport.controller.js';

const router = express.Router();

router.get('/', getEquipmentReports);
router.post('/', createEquipmentReport);
router.put('/:id', updateEquipmentReport);
router.delete('/:id', deleteEquipmentReport);

export default router;
