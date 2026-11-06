import { Request, Response } from 'express';
import { assignmentsService } from './assignments.service';
import { storage } from '../../utils/storage';

export const assignmentsController = {
  async create(req: Request, res: Response) {
    const assignment = await assignmentsService.create(req.params.sectionId, req.user!.id, req.body);
    res.status(201).json({ data: assignment });
  },

  async listForSection(req: Request, res: Response) {
    const assignments = await assignmentsService.listForSection(req.params.sectionId, req.user!.id);
    res.json({ data: assignments });
  },

  async update(req: Request, res: Response) {
    const assignment = await assignmentsService.update(req.params.id, req.user!.id, req.body);
    res.json({ data: assignment });
  },

  async remove(req: Request, res: Response) {
    await assignmentsService.remove(req.params.id, req.user!.id);
    res.status(204).send();
  },

  async listSubmissions(req: Request, res: Response) {
    const submissions = await assignmentsService.listSubmissions(req.params.id, req.user!.id);
    res.json({ data: submissions });
  },

  async gradeSubmission(req: Request, res: Response) {
    const submission = await assignmentsService.gradeSubmission(req.params.submissionId, req.user!.id, req.body);
    res.json({ data: submission });
  },

  async getForSubmission(req: Request, res: Response) {
    const assignment = await assignmentsService.getForSubmission(req.params.id, req.user!.id);
    res.json({ data: assignment });
  },

  async getResultsForStudent(req: Request, res: Response) {
    const results = await assignmentsService.getResultsForStudent(req.user!.id);
    res.json({ data: results });
  },

  async submit(req: Request, res: Response) {
    const fileUrl = req.file ? storage.urlFor(`submissions/${req.file.filename}`) : undefined;
    const submission = await assignmentsService.submit(req.params.id, req.user!.id, {
      submissionText: req.body.submissionText,
      fileUrl,
    });
    res.status(201).json({ data: submission });
  },
};
