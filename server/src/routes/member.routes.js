import express from 'express';
import validate from '../middlewares/validate.middleware.js';
import { verifyToken, restrictTo } from '../middlewares/auth.middleware.js';
import { createMemberSchema, getMembersSchema } from '../validations/member.validation.js';
import {
  createMember, getMembers, getMemberById,
  updateMember, deleteMember, getMemberWorkoutLogs, getMemberPayments,
  checkDuplicate, getMemberFeedbacksByStaff
} from '../controllers/member.controller.js';
import { getMyStudents, getTrainerDashboardStats } from '../controllers/subscription.controller.js';

const router = express.Router();

router.post('/check-duplicate', verifyToken, restrictTo('manager', 'owner'), checkDuplicate);
router.post('/', verifyToken, restrictTo('manager', 'owner'), validate(createMemberSchema), createMember);
router.get('/', verifyToken, restrictTo('manager', 'owner', 'pt'), validate(getMembersSchema), getMembers);
// Route /my-students/stats phải đứng trước /my-students để không bị nhầm
router.get('/my-students/stats', verifyToken, restrictTo('pt'), getTrainerDashboardStats);
router.get('/my-students', verifyToken, restrictTo('pt'), getMyStudents);
router.get('/:id', verifyToken, restrictTo('manager', 'owner', 'pt'), getMemberById);
router.put('/:id', verifyToken, restrictTo('manager', 'owner'), updateMember);
router.delete('/:id', verifyToken, restrictTo('manager', 'owner'), deleteMember);
router.get('/:id/workout-logs', verifyToken, restrictTo('manager', 'owner', 'pt'), getMemberWorkoutLogs);
router.get('/:id/payments', verifyToken, restrictTo('manager', 'owner', 'pt'), getMemberPayments);
router.get('/:id/feedbacks', verifyToken, restrictTo('manager', 'owner', 'pt'), getMemberFeedbacksByStaff);

export default router;

