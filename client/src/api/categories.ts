import { apiClient } from './client';

export interface Category {
  id: string;
  slug: string;
  icon: string | null;
  name: Partial<Record<'en' | 'fr' | 'ar', string>>;
  courseCount: number;
}

export interface CategoryNameInput {
  en: string;
  fr: string;
  ar: string;
}

export const categoriesApi = {
  async list() {
    const res = await apiClient.get<{ data: Category[] }>('/categories');
    return res.data.data;
  },

  async create(slug: string, icon: string | undefined, name: CategoryNameInput) {
    const res = await apiClient.post<{ data: Category }>('/categories', { slug, icon, name });
    return res.data.data;
  },

  async update(id: string, data: { icon?: string; name?: Partial<CategoryNameInput> }) {
    const res = await apiClient.patch<{ data: Category }>(`/categories/${id}`, data);
    return res.data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },
};
