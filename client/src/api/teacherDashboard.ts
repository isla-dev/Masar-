import { apiClient } from './client';

export interface TeacherOverview {
  courses: { total: number; published: number; draft: number; pending: number; rejected: number };
  totalStudents: number;
  completionRate: number;
  recentEnrollments: { studentName: string; courseTitle: string; courseId: string; enrolledAt: string }[];
  recentSubmissions: {
    id: string;
    studentName: string;
    assignmentTitle: string;
    assignmentId: string;
    courseTitle: string;
    submittedAt: string;
    grade: number | null;
  }[];
}

export interface EnrolledStudent {
  enrollmentId: string;
  status: 'active' | 'completed';
  enrolledAt: string;
  completedAt: string | null;
  student: { id: string; name: string; email: string };
  progress: { totalLectures: number; completedLectures: number; percent: number };
}

export const teacherDashboardApi = {
  async getOverview() {
    const res = await apiClient.get<{ data: TeacherOverview }>('/teacher/overview');
    return res.data.data;
  },
  async getEnrolledStudents(courseId: string) {
    const res = await apiClient.get<{ data: EnrolledStudent[] }>(`/teacher/courses/${courseId}/students`);
    return res.data.data;
  },
};
