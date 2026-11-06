import { apiClient } from './client';

export interface OwnedCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isFree: boolean;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  language: 'en' | 'fr' | 'ar';
  rejectionReason: string | null;
  category: { id: string; slug: string } | null;
  enrollmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFormInput {
  title: string;
  description?: string;
  categoryId?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isFree: boolean;
  language: 'en' | 'fr' | 'ar';
}

export const teacherCoursesApi = {
  async listMine(params: { status?: string; page?: number; limit?: number } = {}) {
    const res = await apiClient.get<{ data: OwnedCourse[]; meta: any }>('/courses/mine', { params });
    return res.data;
  },

  async getMine(id: string) {
    const res = await apiClient.get<{ data: OwnedCourse }>(`/courses/mine/${id}`);
    return res.data.data;
  },

  async create(input: CourseFormInput) {
    const res = await apiClient.post<{ data: OwnedCourse }>('/courses', input);
    return res.data.data;
  },

  async update(id: string, input: Partial<CourseFormInput>) {
    const res = await apiClient.patch<{ data: OwnedCourse }>(`/courses/${id}`, input);
    return res.data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/courses/${id}`);
  },

  async submit(id: string) {
    const res = await apiClient.post<{ data: OwnedCourse }>(`/courses/${id}/submit`);
    return res.data.data;
  },

  async uploadThumbnail(id: string, file: File) {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const res = await apiClient.post<{ data: OwnedCourse }>(`/courses/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};
