import { z } from 'zod';

export const createCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  icon: z.string().trim().max(150).optional(),
  name: z.object({
    en: z.string().trim().min(1).max(150),
    fr: z.string().trim().min(1).max(150),
    ar: z.string().trim().min(1).max(150),
  }),
});

export const updateCategorySchema = z.object({
  icon: z.string().trim().max(150).optional(),
  name: z
    .object({
      en: z.string().trim().min(1).max(150).optional(),
      fr: z.string().trim().min(1).max(150).optional(),
      ar: z.string().trim().min(1).max(150).optional(),
    })
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
