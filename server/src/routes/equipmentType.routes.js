import express from 'express';
import {
  getEquipmentTypes,
  createEquipmentType,
  updateEquipmentType,
  deleteEquipmentType
} from '../controllers/equipmentType.controller.js';

const router = express.Router();

router.get('/', getEquipmentTypes);
router.post('/', createEquipmentType);
router.put('/:id', updateEquipmentType);
router.delete('/:id', deleteEquipmentType);

export default router;
