import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import {
  createSubscriptionSchema,
  paySubscriptionSchema,
  renewSubscriptionSchema,
} from '../validations/subscription.validation.js';
import {
  getMySubscriptions,
  createSubscription,
  processSubscriptionPayment,
  renewSubscription,
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

// Renew subscription (member/manager/owner/pt)
router.post(
  '/renew',
  verifyToken,
  restrictTo('member', 'manager', 'owner', 'pt'),
  validate(renewSubscriptionSchema),
  renewSubscription,
);

export default router;
