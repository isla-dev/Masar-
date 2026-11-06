import { Router } from 'express';
import { lecturesController } from './lectures.controller';
import { validateBody } from '../../middleware/validate';
import { createLectureSchema, updateLectureSchema } from './lectures.validation';
import { authenticate, authorize } from '../../middleware/auth';
import { lectureContentUpload } from '../../config/multer';

// Mounted at /api/sections/:sectionId/lectures
export const nestedLecturesRouter = Router({ mergeParams: true });
nestedLecturesRouter.post(
  '/',
  authenticate,
  authorize('teacher'),
  validateBody(createLectureSchema),
  lecturesController.create
);
nestedLecturesRouter.get('/', authenticate, authorize('teacher'), lecturesController.listForSection);

// Mounted at /api/lectures
export const flatLecturesRouter = Router();
flatLecturesRouter.patch(
  '/:id',
  authenticate,
  authorize('teacher'),
  validateBody(updateLectureSchema),
  lecturesController.update
);
flatLecturesRouter.delete('/:id', authenticate, authorize('teacher'), lecturesController.remove);
flatLecturesRouter.post(
  '/:id/content',
  authenticate,
  authorize('teacher'),
  lectureContentUpload.single('file'),
  lecturesController.uploadContent
);
