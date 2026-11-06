import { Request, Response, Router } from 'express';
import { teacherDashboardService } from './teacherDashboard.service';
import { authenticate, authorize } from '../../middleware/auth';

const teacherDashboardController = {
  async getOverview(req: Request, res: Response) {
    const overview = await teacherDashboardService.getOverview(req.user!.id);
    res.json({ data: overview });
  },

  async getEnrolledStudents(req: Request, res: Response) {
    const students = await teacherDashboardService.getEnrolledStudents(req.params.courseId, req.user!.id);
    res.json({ data: students });
  },
};

const router = Router();
router.get('/overview', authenticate, authorize('teacher'), teacherDashboardController.getOverview);
router.get(
  '/courses/:courseId/students',
  authenticate,
  authorize('teacher'),
  teacherDashboardController.getEnrolledStudents
);

export default router;
