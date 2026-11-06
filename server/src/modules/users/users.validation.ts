import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(255).optional(),
  preferredLanguage: z.enum(['en', 'fr', 'ar']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export type UpdateProfileInputDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInputDto = z.infer<typeof changePasswordSchema>;
