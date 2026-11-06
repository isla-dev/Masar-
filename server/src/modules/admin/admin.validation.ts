import { z } from 'zod';

export const rejectCourseSchema = z.object({
  reason: z.string().trim().min(3).max(1000),
});

export const listCoursesAdminQuerySchema = z.object({
  status: z.enum(['draft', 'pending', 'published', 'rejected']).optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(['student', 'teacher']).optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const setUserActiveSchema = z.object({
  isActive: z.boolean(),
});

export const listCertificatesQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type RejectCourseInput = z.infer<typeof rejectCourseSchema>;
export type ListCoursesAdminQuery = z.infer<typeof listCoursesAdminQuerySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type SetUserActiveInput = z.infer<typeof setUserActiveSchema>;
export type ListCertificatesQuery = z.infer<typeof listCertificatesQuerySchema>;
