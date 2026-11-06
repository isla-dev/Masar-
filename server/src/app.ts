import 'express-async-errors'; // must be imported before routes
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import path from 'path';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/categories.routes';
import courseRoutes from './modules/courses/courses.routes';
import { nestedSectionsRouter, flatSectionsRouter } from './modules/sections/sections.routes';
import { nestedLecturesRouter, flatLecturesRouter } from './modules/lectures/lectures.routes';
import { nestedQuizzesRouter, flatQuizzesRouter } from './modules/quizzes/quizzes.routes';
import {
  nestedAssignmentsRouter,
  flatAssignmentsRouter,
  submissionsRouter,
} from './modules/assignments/assignments.routes';
import enrollmentRoutes from './modules/enrollments/enrollments.routes';
import certificateRoutes from './modules/certificates/certificates.routes';
import userRoutes from './modules/users/users.routes';
import teacherDashboardRoutes from './modules/teacher/teacherDashboard.routes';
import adminRoutes from './modules/admin/admin.routes';
import paymentRoutes from './modules/payments/payments.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(
    express.json({
      // Chargily's webhook signature is computed over the exact raw request
      // bytes — express.json() only gives us the re-parsed object by default,
      // which isn't guaranteed to byte-match. Stash the raw buffer alongside
      // it so the payments webhook handler can verify against it.
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(cookieParser());
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // Uploaded files (thumbnails, lecture content) served directly.
  // Swap for a CDN/S3-backed static host in production.
  // helmet() sets Cross-Origin-Resource-Policy: same-origin by default, which
  // would silently block the frontend (a different origin/port in dev) from
  // loading these images/files even with CORS configured — CORP is a
  // separate browser mechanism the `cors` package doesn't touch. These files
  // are meant to be publicly loadable, so relax it just for this path.
  app.use(
    '/uploads',
    (_req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(path.resolve(process.cwd(), env.UPLOAD_DIR))
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/courses/:courseId/sections', nestedSectionsRouter);
  app.use('/api/sections/:sectionId/lectures', nestedLecturesRouter);
  app.use('/api/sections/:sectionId/quizzes', nestedQuizzesRouter);
  app.use('/api/sections/:sectionId/assignments', nestedAssignmentsRouter);
  app.use('/api/sections', flatSectionsRouter);
  app.use('/api/lectures', flatLecturesRouter);
  app.use('/api/quizzes', flatQuizzesRouter);
  app.use('/api/assignments', flatAssignmentsRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use('/api', enrollmentRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/teacher', teacherDashboardRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', paymentRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
