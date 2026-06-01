import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import {
  createPackageSchema,
  getPackageSchema,
} from '../validations/subscriptionPackage.validation.js';
import {
  createPackage,
  getActivePackages,
} from '../controllers/subscriptionPackage.controller.js';

const router = express.Router();

router.post('/', verifyToken, restrictTo('owner'), validate(createPackageSchema), createPackage);

// Public endpoint: chỉ trả về các gói đang hoạt động
router.get('/', validate(getPackageSchema), getActivePackages);

export default router;
