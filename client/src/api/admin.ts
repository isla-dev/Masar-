import { apiClient } from './client';
import { PaginatedMeta } from './courses';

export interface AdminCourseSummary {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  level: string;
  isFree: boolean;
  price?: number;
  teacherName: string;
  teacherEmail?: string;
  categorySlug: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'teacher';
  isActive: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalStudents: number;
  totalTeachers: number;
  courses: { total: number; published: number; pending: number; draft: number; rejected: number };
  enrollments: { total: number; completed: number };
  totalCertificates: number;
  totalCategories: number;
}

export interface AdminCertificate {
  id: string;
  certificateNumber: string;
  pdfUrl: string;
  issuedAt: string;
  studentName: string;
  courseTitle: string;
}

export const adminApi = {
  async getStats() {
    const res = await apiClient.get<{ data: PlatformStats }>('/admin/stats');
    return res.data.data;
  },

  async listPendingCourses() {
    const res = await apiClient.get<{ data: AdminCourseSummary[] }>('/admin/courses/pending');
    return res.data.data;
  },

  async listAllCourses(params: { status?: string; search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<{ data: AdminCourseSummary[]; meta: PaginatedMeta }>('/admin/courses', {
      params,
    });
    return res.data;
  },

  async approveCourse(id: string) {
    const res = await apiClient.patch<{ data: AdminCourseSummary }>(`/admin/courses/${id}/approve`);
    return res.data.data;
  },

  async rejectCourse(id: string, reason: string) {
    const res = await apiClient.patch<{ data: AdminCourseSummary }>(`/admin/courses/${id}/reject`, { reason });
    return res.data.data;
  },

  async listUsers(params: { role?: string; search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<{ data: AdminUser[]; meta: PaginatedMeta }>('/admin/users', { params });
    return res.data;
  },

  async setUserActive(id: string, isActive: boolean) {
    const res = await apiClient.patch<{ data: AdminUser }>(`/admin/users/${id}/status`, { isActive });
    return res.data.data;
  },

  async listCertificates(params: { search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<{ data: AdminCertificate[]; meta: PaginatedMeta }>('/admin/certificates', {
      params,
    });
    return res.data;
  },
};
