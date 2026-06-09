import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import {
  createSubscriptionSchema,
  paySubscriptionSchema,
} from '../validations/subscription.validation.js';
import {
  getMySubscriptions,
  createSubscription,
  processSubscriptionPayment,
} from '../controllers/subscription.controller.js';

const router = express.Router();

// Get current user's subscriptions
router.get('/me', verifyToken, getMySubscriptions);

// Create subscription (manager/owner only)
router.post(
  '/',
  verifyToken,
  restrictTo('manager', 'owner'),
  validate(createSubscriptionSchema),
  createSubscription,
);

// Process payment (manager/owner only)
router.post(
  '/:id/pay',
  verifyToken,
  restrictTo('manager', 'owner'),
  validate(paySubscriptionSchema),
  processSubscriptionPayment,
);

export default router;
