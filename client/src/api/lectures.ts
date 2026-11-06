import { apiClient } from './client';

export interface Lecture {
  id: string;
  sectionId: string;
  title: string;
  contentType: 'video' | 'text' | 'file';
  contentUrl: string | null;
  durationSeconds: number | null;
  orderIndex: number;
  createdAt: string;
}

export const lecturesApi = {
  async listForSection(sectionId: string) {
    const res = await apiClient.get<{ data: Lecture[] }>(`/sections/${sectionId}/lectures`);
    return res.data.data;
  },

  async create(sectionId: string, data: { title: string; contentType: Lecture['contentType']; durationSeconds?: number }) {
    const res = await apiClient.post<{ data: Lecture }>(`/sections/${sectionId}/lectures`, data);
    return res.data.data;
  },

  async update(id: string, data: Partial<Pick<Lecture, 'title' | 'contentType' | 'durationSeconds' | 'orderIndex'>>) {
    const res = await apiClient.patch<{ data: Lecture }>(`/lectures/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/lectures/${id}`);
  },

  async uploadContent(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ data: Lecture }>(`/lectures/${id}/content`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};
