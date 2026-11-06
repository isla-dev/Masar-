import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { initiateCheckoutSchema } from './payments.validation';

const router = Router();

router.post(
  '/courses/:courseId/checkout',
  authenticate,
  authorize('student'),
  validateBody(initiateCheckoutSchema),
  paymentsController.initiateCheckout
);

// Public — Chargily calls this server-to-server. Authenticity is established
// via the signature header, verified inside the service, not auth middleware.
router.post('/payments/webhook/chargily', paymentsController.webhook);

export default router;
