import { Router } from 'express';
import { quizzesController } from './quizzes.controller';
import { validateBody } from '../../middleware/validate';
import {
  createQuizSchema,
  replaceQuestionsSchema,
  submitAttemptSchema,
  updateQuizMetaSchema,
} from './quizzes.validation';
import { authenticate, authorize } from '../../middleware/auth';

// Mounted at /api/sections/:sectionId/quizzes
export const nestedQuizzesRouter = Router({ mergeParams: true });
nestedQuizzesRouter.post(
  '/',
  authenticate,
  authorize('teacher'),
  validateBody(createQuizSchema),
  quizzesController.create
);
nestedQuizzesRouter.get('/', authenticate, authorize('teacher'), quizzesController.listForSection);

// Mounted at /api/quizzes
export const flatQuizzesRouter = Router();

// Student-facing (registered before the teacher-owned '/:id' GET so they don't collide on method+shape)
flatQuizzesRouter.get('/results/mine', authenticate, authorize('student'), quizzesController.getResultsForStudent);
flatQuizzesRouter.get('/:id/attempt', authenticate, authorize('student'), quizzesController.getForAttempt);
flatQuizzesRouter.post(
  '/:id/attempt',
  authenticate,
  authorize('student'),
  validateBody(submitAttemptSchema),
  quizzesController.submitAttempt
);

// Teacher-owned management
flatQuizzesRouter.get('/:id', authenticate, authorize('teacher'), quizzesController.getOwned);
flatQuizzesRouter.patch(
  '/:id',
  authenticate,
  authorize('teacher'),
  validateBody(updateQuizMetaSchema),
  quizzesController.updateMeta
);
flatQuizzesRouter.put(
  '/:id/questions',
  authenticate,
  authorize('teacher'),
  validateBody(replaceQuestionsSchema),
  quizzesController.replaceQuestions
);
flatQuizzesRouter.delete('/:id', authenticate, authorize('teacher'), quizzesController.remove);
