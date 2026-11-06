import { Request, Response } from 'express';
import { lecturesService } from './lectures.service';
import { storage } from '../../utils/storage';
import { AppError } from '../../utils/AppError';

export const lecturesController = {
  async create(req: Request, res: Response) {
    const lecture = await lecturesService.create(req.params.sectionId, req.user!.id, req.body);
    res.status(201).json({ data: lecture });
  },

  async listForSection(req: Request, res: Response) {
    const lectures = await lecturesService.listForSection(req.params.sectionId, req.user!.id);
    res.json({ data: lectures });
  },

  async update(req: Request, res: Response) {
    const lecture = await lecturesService.update(req.params.id, req.user!.id, req.body);
    res.json({ data: lecture });
  },

  async remove(req: Request, res: Response) {
    await lecturesService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  },

  async uploadContent(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'BAD_REQUEST');
    }
    const url = storage.urlFor(`lectures/${req.file.filename}`);
    const lecture = await lecturesService.setContent(req.params.id, req.user!.id, url);
    res.json({ data: lecture });
  },
};
