import { Request, Response } from 'express';
import { certificatesService } from './certificates.service';

export const certificatesController = {
  async listMine(req: Request, res: Response) {
    const certificates = await certificatesService.listMine(req.user!.id);
    res.json({ data: certificates });
  },

  async verify(req: Request, res: Response) {
    const result = await certificatesService.verify(req.params.certificateNumber);
    res.json({ data: result });
  },
};
