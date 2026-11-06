import { Request, Response } from 'express';
import { paymentsService } from './payments.service';

export const paymentsController = {
  async initiateCheckout(req: Request, res: Response) {
    const result = await paymentsService.initiateCheckout(req.user!.id, req.params.courseId, req.body);
    res.json({ data: result });
  },

  async webhook(req: Request, res: Response) {
    // req.rawBody is populated by the verify() hook on express.json() in app.ts —
    // signature verification needs the exact raw bytes, not the re-parsed object.
    const rawBody = (req as any).rawBody as Buffer;
    const signature = req.get('signature');
    await paymentsService.handleWebhook(rawBody, signature);
    res.sendStatus(200);
  },
};
