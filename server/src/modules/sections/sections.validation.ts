import { z } from 'zod';

export const createSectionSchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export const updateSectionSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
