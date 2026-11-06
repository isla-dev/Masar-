import { Request, Response } from 'express';
import { sectionsService } from './sections.service';

export const sectionsController = {
  async create(req: Request, res: Response) {
    const section = await sectionsService.create(req.params.courseId, req.user!.id, req.body);
    res.status(201).json({ data: section });
  },

  async listForCourse(req: Request, res: Response) {
    const sections = await sectionsService.listForCourse(req.params.courseId, req.user!.id);
    res.json({ data: sections });
  },

  async update(req: Request, res: Response) {
    const section = await sectionsService.update(req.params.id, req.user!.id, req.body);
    res.json({ data: section });
  },

  async remove(req: Request, res: Response) {
    await sectionsService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  },
};
