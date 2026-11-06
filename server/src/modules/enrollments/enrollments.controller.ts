import { Request, Response } from 'express';
import { enrollmentsService } from './enrollments.service';

export const enrollmentsController = {
  async enroll(req: Request, res: Response) {
    const enrollment = await enrollmentsService.enroll(req.user!.id, req.params.courseId);
    res.status(201).json({ data: enrollment });
  },

  async listMine(req: Request, res: Response) {
    const enrollments = await enrollmentsService.listMine(req.user!.id);
    res.json({ data: enrollments });
  },

  async getRecentActivity(req: Request, res: Response) {
    const activity = await enrollmentsService.getRecentActivity(req.user!.id);
    res.json({ data: activity });
  },

  async getLearningContent(req: Request, res: Response) {
    const content = await enrollmentsService.getLearningContent(req.params.courseId, req.user!.id);
    res.json({ data: content });
  },

  async completeLecture(req: Request, res: Response) {
    const progress = await enrollmentsService.completeLecture(req.params.lectureId, req.user!.id);
    res.json({ data: progress });
  },
};
