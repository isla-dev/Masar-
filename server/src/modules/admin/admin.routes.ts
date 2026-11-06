import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import {
  listCertificatesQuerySchema,
  listCoursesAdminQuerySchema,
  listUsersQuerySchema,
  rejectCourseSchema,
  setUserActiveSchema,
} from './admin.validation';

const router = Router();

// Every route here is admin-only.
router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getPlatformStats);

router.get('/courses/pending', adminController.listPendingCourses);
router.get('/courses', validateQuery(listCoursesAdminQuerySchema), adminController.listAllCourses);
router.patch('/courses/:id/approve', adminController.approveCourse);
router.patch('/courses/:id/reject', validateBody(rejectCourseSchema), adminController.rejectCourse);

router.get('/users', validateQuery(listUsersQuerySchema), adminController.listUsers);
router.patch('/users/:id/status', validateBody(setUserActiveSchema), adminController.setUserActive);

router.get('/certificates', validateQuery(listCertificatesQuerySchema), adminController.listCertificates);

export default router;
