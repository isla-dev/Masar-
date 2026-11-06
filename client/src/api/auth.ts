import { apiClient } from './client';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  preferred_language: 'en' | 'fr' | 'ar';
  avatar_url: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export const authApi = {
  async login(email: string, password: string) {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', { email, password });
    return res.data.data;
  },

  async register(payload: {
    email: string;
    password: string;
    fullName: string;
    role: 'student' | 'teacher';
    preferredLanguage: 'en' | 'fr' | 'ar';
  }) {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', payload);
    return res.data.data;
  },

  async refresh() {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/refresh');
    return res.data.data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};
