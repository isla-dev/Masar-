import { Request, Response } from 'express';
import { coursesService } from './courses.service';
import { ListCoursesQuery, ListMineQuery } from './courses.validation';
import { storage } from '../../utils/storage';
import { AppError } from '../../utils/AppError';

export const coursesController = {
  async list(_req: Request, res: Response) {
    const params = res.locals.query as ListCoursesQuery;
    const result = await coursesService.list(params);
    res.json(result);
  },

  async detail(req: Request, res: Response) {
    const course = await coursesService.detail(req.params.id, req.user?.id);
    res.json({ data: course });
  },

  async listMine(req: Request, res: Response) {
    const params = res.locals.query as ListMineQuery;
    const result = await coursesService.listMine(req.user!.id, params);
    res.json(result);
  },

  async getMine(req: Request, res: Response) {
    const course = await coursesService.getOwned(req.params.id, req.user!.id);
    res.json({ data: course });
  },

  async create(req: Request, res: Response) {
    const course = await coursesService.create(req.user!.id, req.body);
    res.status(201).json({ data: course });
  },

  async update(req: Request, res: Response) {
    const course = await coursesService.update(req.params.id, req.user!.id, req.body);
    res.json({ data: course });
  },

  async remove(req: Request, res: Response) {
    await coursesService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  },

  async submit(req: Request, res: Response) {
    const course = await coursesService.submitForReview(req.params.id, req.user!.id);
    res.json({ data: course });
  },

  async uploadThumbnail(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'BAD_REQUEST');
    }
    const url = storage.urlFor(`thumbnails/${req.file.filename}`);
    const course = await coursesService.setThumbnail(req.params.id, req.user!.id, url);
    res.json({ data: course });
  },
};
