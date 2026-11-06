import { Request, Response } from 'express';
import { usersService } from './users.service';
import { storage } from '../../utils/storage';
import { AppError } from '../../utils/AppError';

export const usersController = {
  async getMe(req: Request, res: Response) {
    const user = await usersService.getProfile(req.user!.id);
    res.json({ data: user });
  },

  async updateMe(req: Request, res: Response) {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    res.json({ data: user });
  },

  async uploadAvatar(req: Request, res: Response) {
    if (!req.file) throw new AppError('No file uploaded', 400, 'BAD_REQUEST');
    const url = storage.urlFor(`avatars/${req.file.filename}`);
    const user = await usersService.updateAvatar(req.user!.id, url);
    res.json({ data: user });
  },

  async changePassword(req: Request, res: Response) {
    await usersService.changePassword(req.user!.id, req.body);
    res.status(204).send();
  },
};
