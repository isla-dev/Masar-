import { Router } from 'express';
import { assignmentsController } from './assignments.controller';
import { validateBody } from '../../middleware/validate';
import {
  createAssignmentSchema,
  gradeSubmissionSchema,
  submitAssignmentSchema,
  updateAssignmentSchema,
} from './assignments.validation';
import { authenticate, authorize } from '../../middleware/auth';
import { submissionUpload } from '../../config/multer';

// Mounted at /api/sections/:sectionId/assignments
export const nestedAssignmentsRouter = Router({ mergeParams: true });
nestedAssignmentsRouter.post(
  '/',
  authenticate,
  authorize('teacher'),
  validateBody(createAssignmentSchema),
  assignmentsController.create
);
nestedAssignmentsRouter.get('/', authenticate, authorize('teacher'), assignmentsController.listForSection);

// Mounted at /api/assignments
export const flatAssignmentsRouter = Router();

flatAssignmentsRouter.get('/results/mine', authenticate, authorize('student'), assignmentsController.getResultsForStudent);
flatAssignmentsRouter.get('/:id/submission', authenticate, authorize('student'), assignmentsController.getForSubmission);
flatAssignmentsRouter.post(
  '/:id/submit',
  authenticate,
  authorize('student'),
  submissionUpload.single('file'),
  validateBody(submitAssignmentSchema),
  assignmentsController.submit
);

flatAssignmentsRouter.get('/:id/submissions', authenticate, authorize('teacher'), assignmentsController.listSubmissions);
flatAssignmentsRouter.patch(
  '/:id',
  authenticate,
  authorize('teacher'),
  validateBody(updateAssignmentSchema),
  assignmentsController.update
);
flatAssignmentsRouter.delete('/:id', authenticate, authorize('teacher'), assignmentsController.remove);

// Mounted at /api/submissions
export const submissionsRouter = Router();
submissionsRouter.patch(
  '/:submissionId/grade',
  authenticate,
  authorize('teacher'),
  validateBody(gradeSubmissionSchema),
  assignmentsController.gradeSubmission
);
