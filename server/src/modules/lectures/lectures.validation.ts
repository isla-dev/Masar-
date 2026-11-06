import { z } from 'zod';

export const createLectureSchema = z.object({
  title: z.string().trim().min(1).max(255),
  contentType: z.enum(['video', 'text', 'file']).default('video'),
  durationSeconds: z.coerce.number().int().min(0).optional(),
});

export const updateLectureSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  contentType: z.enum(['video', 'text', 'file']).optional(),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
});

export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;
