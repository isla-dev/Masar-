import { apiClient } from './client';

export interface Section {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
}

export const sectionsApi = {
  async listForCourse(courseId: string) {
    const res = await apiClient.get<{ data: Section[] }>(`/courses/${courseId}/sections`);
    return res.data.data;
  },

  async create(courseId: string, title: string) {
    const res = await apiClient.post<{ data: Section }>(`/courses/${courseId}/sections`, { title });
    return res.data.data;
  },

  async update(id: string, data: { title?: string; orderIndex?: number }) {
    const res = await apiClient.patch<{ data: Section }>(`/sections/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/sections/${id}`);
  },
};
