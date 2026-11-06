import { Router } from 'express';
import { certificatesController } from './certificates.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/mine', authenticate, authorize('student'), certificatesController.listMine);
// Public — no auth. This is the whole point of a verification page.
router.get('/verify/:certificateNumber', certificatesController.verify);

export default router;
