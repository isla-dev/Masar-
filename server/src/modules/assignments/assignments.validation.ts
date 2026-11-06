import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  maxScore: z.coerce.number().int().min(1).max(1000).default(100),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const submitAssignmentSchema = z.object({
  submissionText: z.string().trim().max(10000).optional(),
});

export const gradeSubmissionSchema = z.object({
  grade: z.coerce.number().int().min(0),
  feedback: z.string().trim().max(5000).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
