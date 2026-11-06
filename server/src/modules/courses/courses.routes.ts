import { Router } from 'express';
import { coursesController } from './courses.controller';
import { validateBody, validateQuery } from '../../middleware/validate';
import {
  createCourseSchema,
  listCoursesQuerySchema,
  listMineQuerySchema,
  updateCourseSchema,
} from './courses.validation';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth';
import { thumbnailUpload } from '../../config/multer';

const router = Router();

// --- Public catalog ---
router.get('/', validateQuery(listCoursesQuerySchema), coursesController.list);

// --- Teacher-owned course management ---
// NOTE: '/mine' must be registered before '/:id' or Express will treat "mine" as an id.
router.get(
  '/mine',
  authenticate,
  authorize('teacher'),
  validateQuery(listMineQuerySchema),
  coursesController.listMine
);

router.post('/', authenticate, authorize('teacher'), validateBody(createCourseSchema), coursesController.create);

router.get('/mine/:id', authenticate, authorize('teacher'), coursesController.getMine);

router.patch(
  '/:id',
  authenticate,
  authorize('teacher'),
  validateBody(updateCourseSchema),
  coursesController.update
);

router.delete('/:id', authenticate, authorize('teacher'), coursesController.remove);

router.post('/:id/submit', authenticate, authorize('teacher'), coursesController.submit);

router.post(
  '/:id/thumbnail',
  authenticate,
  authorize('teacher'),
  thumbnailUpload.single('thumbnail'),
  coursesController.uploadThumbnail
);

// --- Public course detail (kept last so it doesn't shadow the routes above) ---
router.get('/:id', optionalAuthenticate, coursesController.detail);

export default router;
