import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import {
  createSubscriptionSchema,
  paySubscriptionSchema,
} from '../validations/subscription.validation.js';
import {
  createSubscription,
  processSubscriptionPayment,
} from '../controllers/subscription.controller.js';

const router = express.Router();

router.post(
  '/',
  verifyToken,
  restrictTo('manager', 'owner'),
  validate(createSubscriptionSchema),
  createSubscription,
);

router.post(
  '/:id/pay',
  verifyToken,
  restrictTo('manager', 'owner'),
  validate(paySubscriptionSchema),
  processSubscriptionPayment,
);

export default router;
