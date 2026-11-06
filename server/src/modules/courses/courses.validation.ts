import { z } from 'zod';

export const listCoursesQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  category: z.string().uuid().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.enum(['en', 'fr', 'ar']).optional(),
  isFree: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;

export const createCourseSchema = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().max(5000).optional(),
  categoryId: z.string().uuid().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  price: z.coerce.number().min(0).default(0),
  isFree: z.boolean().default(true),
  language: z.enum(['en', 'fr', 'ar']).default('en'),
});

export const updateCourseSchema = createCourseSchema.partial();

export const listMineQuerySchema = z.object({
  status: z.enum(['draft', 'pending', 'published', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListMineQuery = z.infer<typeof listMineQuerySchema>;
