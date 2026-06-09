import express from 'express';
import {
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage
} from '../controllers/package.controller.js';

const router = express.Router();

router.route('/')
    .get(getAllPackages)
    .post(createPackage);

router.route('/:id')
    .put(updatePackage)
    .delete(deletePackage);

export default router;
