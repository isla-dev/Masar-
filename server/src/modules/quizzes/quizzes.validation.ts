import { z } from 'zod';

const answerSchema = z.object({
  answerText: z.string().trim().min(1).max(500),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z
  .object({
    questionText: z.string().trim().min(1).max(1000),
    type: z.enum(['single_choice', 'multiple_choice', 'true_false']).default('single_choice'),
    answers: z.array(answerSchema).min(2).max(8),
  })
  .refine((q) => q.answers.some((a) => a.isCorrect), {
    message: 'Each question needs at least one correct answer',
    path: ['answers'],
  })
  .refine(
    (q) => q.type === 'multiple_choice' || q.answers.filter((a) => a.isCorrect).length === 1,
    { message: 'Single-choice and true/false questions need exactly one correct answer', path: ['answers'] }
  );

export const createQuizSchema = z.object({
  title: z.string().trim().min(1).max(255),
  passingScore: z.coerce.number().int().min(0).max(100).default(70),
  questions: z.array(questionSchema).min(1).max(50),
});

export const updateQuizMetaSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  passingScore: z.coerce.number().int().min(0).max(100).optional(),
});

export const replaceQuestionsSchema = z.object({
  questions: z.array(questionSchema).min(1).max(50),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answerIds: z.array(z.string().uuid()).min(1),
    })
  ),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizMetaInput = z.infer<typeof updateQuizMetaSchema>;
export type ReplaceQuestionsInput = z.infer<typeof replaceQuestionsSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
