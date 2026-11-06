import { apiClient } from './client';
import { AuthUser } from './auth';

export const usersApi = {
  async getMe() {
    const res = await apiClient.get<{ data: AuthUser }>('/users/me');
    return res.data.data;
  },
  async updateMe(data: { fullName?: string; preferredLanguage?: 'en' | 'fr' | 'ar' }) {
    const res = await apiClient.patch<{ data: AuthUser }>('/users/me', data);
    return res.data.data;
  },
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post<{ data: AuthUser }>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await apiClient.post('/users/me/password', { currentPassword, newPassword });
  },
};
