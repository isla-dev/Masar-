import { Request, Response } from 'express';
import { adminService } from './admin.service';
import {
  ListCertificatesQuery,
  ListCoursesAdminQuery,
  ListUsersQuery,
  RejectCourseInput,
  SetUserActiveInput,
} from './admin.validation';

export const adminController = {
  async listPendingCourses(_req: Request, res: Response) {
    const courses = await adminService.listPendingCourses();
    res.json({ data: courses });
  },

  async listAllCourses(_req: Request, res: Response) {
    const result = await adminService.listAllCourses(res.locals.query as ListCoursesAdminQuery);
    res.json(result);
  },

  async approveCourse(req: Request, res: Response) {
    const course = await adminService.approveCourse(req.params.id);
    res.json({ data: course });
  },

  async rejectCourse(req: Request, res: Response) {
    const { reason } = req.body as RejectCourseInput;
    const course = await adminService.rejectCourse(req.params.id, reason);
    res.json({ data: course });
  },

  async listUsers(_req: Request, res: Response) {
    const result = await adminService.listUsers(res.locals.query as ListUsersQuery);
    res.json(result);
  },

  async setUserActive(req: Request, res: Response) {
    const { isActive } = req.body as SetUserActiveInput;
    const user = await adminService.setUserActive(req.params.id, isActive);
    res.json({ data: user });
  },

  async getPlatformStats(_req: Request, res: Response) {
    const stats = await adminService.getPlatformStats();
    res.json({ data: stats });
  },

  async listCertificates(_req: Request, res: Response) {
    const result = await adminService.listCertificates(res.locals.query as ListCertificatesQuery);
    res.json(result);
  },
};
