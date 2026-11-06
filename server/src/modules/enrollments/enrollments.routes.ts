import { Router } from 'express';
import { enrollmentsController } from './enrollments.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.post('/courses/:courseId/enroll', authenticate, authorize('student'), enrollmentsController.enroll);
router.get('/courses/:courseId/learn', authenticate, authorize('student'), enrollmentsController.getLearningContent);
router.get('/enrollments/mine', authenticate, authorize('student'), enrollmentsController.listMine);
router.get('/enrollments/mine/activity', authenticate, authorize('student'), enrollmentsController.getRecentActivity);
router.post('/lectures/:lectureId/complete', authenticate, authorize('student'), enrollmentsController.completeLecture);

export default router;
