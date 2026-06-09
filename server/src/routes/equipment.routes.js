import express from 'express';
import {
    getEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment
} from '../controllers/equipment.controller.js';

const router = express.Router();

router.get('/', getEquipments);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

export default router;
