import { Request, Response, Router } from 'express';
import { categoriesService } from './categories.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createCategorySchema, updateCategorySchema } from './categories.validation';

const categoriesController = {
  async list(_req: Request, res: Response) {
    const categories = await categoriesService.listAll();
    res.json({ data: categories });
  },

  async create(req: Request, res: Response) {
    const { slug, icon, name } = req.body;
    const category = await categoriesService.create(slug, icon ?? null, name);
    res.status(201).json({ data: category });
  },

  async update(req: Request, res: Response) {
    const category = await categoriesService.update(req.params.id, req.body);
    res.json({ data: category });
  },

  async remove(req: Request, res: Response) {
    await categoriesService.remove(req.params.id);
    res.status(204).send();
  },
};

const router = Router();
router.get('/', categoriesController.list);
router.post('/', authenticate, authorize('admin'), validateBody(createCategorySchema), categoriesController.create);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateBody(updateCategorySchema),
  categoriesController.update
);
router.delete('/:id', authenticate, authorize('admin'), categoriesController.remove);

export default router;
