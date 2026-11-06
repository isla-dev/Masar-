import { Router } from 'express';
import { usersController } from './users.controller';
import { validateBody } from '../../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from './users.validation';
import { authenticate } from '../../middleware/auth';
import { avatarUpload } from '../../config/multer';

const router = Router();

router.get('/me', authenticate, usersController.getMe);
router.patch('/me', authenticate, validateBody(updateProfileSchema), usersController.updateMe);
router.post('/me/avatar', authenticate, avatarUpload.single('avatar'), usersController.uploadAvatar);
router.post('/me/password', authenticate, validateBody(changePasswordSchema), usersController.changePassword);

export default router;
