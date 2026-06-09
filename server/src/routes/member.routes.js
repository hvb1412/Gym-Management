import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import {
  createMemberSchema,
  getMembersSchema,
} from '../validations/member.validation.js';
import { createMember, getMembers } from '../controllers/member.controller.js';

const router = express.Router();

router.post(
  '/',
  verifyToken,
  restrictTo('manager', 'owner'),
  validate(createMemberSchema),
  createMember,
);

router.get(
  '/',
  verifyToken,
  restrictTo('manager', 'owner'),
  validate(getMembersSchema),
  getMembers,
);

export default router;
