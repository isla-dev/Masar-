import { Request, Response } from 'express';
import { quizzesService } from './quizzes.service';

export const quizzesController = {
  async create(req: Request, res: Response) {
    const quiz = await quizzesService.create(req.params.sectionId, req.user!.id, req.body);
    res.status(201).json({ data: quiz });
  },

  async listForSection(req: Request, res: Response) {
    const quizzes = await quizzesService.listForSection(req.params.sectionId, req.user!.id);
    res.json({ data: quizzes });
  },

  async getOwned(req: Request, res: Response) {
    const quiz = await quizzesService.getOwnedWithQuestions(req.params.id, req.user!.id);
    res.json({ data: quiz });
  },

  async updateMeta(req: Request, res: Response) {
    const quiz = await quizzesService.updateMeta(req.params.id, req.user!.id, req.body);
    res.json({ data: quiz });
  },

  async replaceQuestions(req: Request, res: Response) {
    const quiz = await quizzesService.replaceQuestions(req.params.id, req.user!.id, req.body.questions);
    res.json({ data: quiz });
  },

  async remove(req: Request, res: Response) {
    await quizzesService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  },

  async getForAttempt(req: Request, res: Response) {
    const quiz = await quizzesService.getForAttempt(req.params.id, req.user!.id);
    res.json({ data: quiz });
  },

  async getResultsForStudent(req: Request, res: Response) {
    const results = await quizzesService.getResultsForStudent(req.user!.id);
    res.json({ data: results });
  },

  async submitAttempt(req: Request, res: Response) {
    const result = await quizzesService.submitAttempt(req.params.id, req.user!.id, req.body);
    res.status(201).json({ data: result });
  },
};
