import { Router } from 'express';
import { sectionsController } from './sections.controller';
import { validateBody } from '../../middleware/validate';
import { createSectionSchema, updateSectionSchema } from './sections.validation';
import { authenticate, authorize } from '../../middleware/auth';

// Mounted at /api/courses/:courseId/sections
export const nestedSectionsRouter = Router({ mergeParams: true });
nestedSectionsRouter.post(
  '/',
  authenticate,
  authorize('teacher'),
  validateBody(createSectionSchema),
  sectionsController.create
);
nestedSectionsRouter.get('/', authenticate, authorize('teacher'), sectionsController.listForCourse);

// Mounted at /api/sections
export const flatSectionsRouter = Router();
flatSectionsRouter.patch(
  '/:id',
  authenticate,
  authorize('teacher'),
  validateBody(updateSectionSchema),
  sectionsController.update
);
flatSectionsRouter.delete('/:id', authenticate, authorize('teacher'), sectionsController.remove);
