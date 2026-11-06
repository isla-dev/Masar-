import { apiClient } from './client';

export interface CourseListItem {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isFree: boolean;
  language: 'en' | 'fr' | 'ar';
  category: { id: string; slug: string } | null;
  teacher: { id: string; name: string };
  lectureCount: number;
  rating: number | null;
  reviewCount: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseListParams {
  search?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: 'en' | 'fr' | 'ar';
  isFree?: boolean;
  page?: number;
  limit?: number;
}

export interface CourseDetail extends Omit<CourseListItem, 'lectureCount'> {
  description: string | null;
  teacher: { id: string; name: string; avatarUrl: string | null };
  enrollmentStatus: 'active' | 'completed' | null;
  curriculum: {
    id: string;
    title: string;
    order: number;
    lectures: { id: string; title: string; contentType: string; durationSeconds: number | null; order: number }[];
  }[];
  counts: { sections: number; lectures: number; quizzes: number; assignments: number };
  createdAt: string;
}

export const coursesApi = {
  async list(params: CourseListParams) {
    const res = await apiClient.get<{ data: CourseListItem[]; meta: PaginatedMeta }>('/courses', {
      params: { ...params, isFree: params.isFree === undefined ? undefined : String(params.isFree) },
    });
    return res.data;
  },

  async detail(id: string) {
    const res = await apiClient.get<{ data: CourseDetail }>(`/courses/${id}`);
    return res.data.data;
  },
};
