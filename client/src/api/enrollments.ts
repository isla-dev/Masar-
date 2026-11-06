import { apiClient } from './client';

export interface MyEnrollment {
  enrollmentId: string;
  status: 'active' | 'completed';
  enrolledAt: string;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    level: string;
    teacherName: string;
  };
  progress: { totalLectures: number; completedLectures: number; percent: number };
}

export interface LearningLecture {
  id: string;
  title: string;
  contentType: 'video' | 'text' | 'file';
  contentUrl: string | null;
  durationSeconds: number | null;
  order: number;
  completed: boolean;
}

export interface LearningQuizSummary {
  id: string;
  title: string;
  passingScore: number;
  order: number;
  bestScore: number | null;
  passed: boolean;
  attemptCount: number;
}

export interface LearningAssignmentSummary {
  id: string;
  title: string;
  dueDate: string | null;
  maxScore: number;
  order: number;
  submitted: boolean;
  grade: number | null;
  graded: boolean;
}

export interface LearningSection {
  id: string;
  title: string;
  order: number;
  lectures: LearningLecture[];
  quizzes: LearningQuizSummary[];
  assignments: LearningAssignmentSummary[];
}

export interface LearningContent {
  enrollmentId: string;
  enrollmentStatus: 'active' | 'completed';
  course: { id: string; title: string; description: string | null };
  curriculum: LearningSection[];
  progress: { totalLectures: number; completedLectures: number; percent: number };
}

export interface RecentActivityItem {
  type: 'lecture' | 'quiz' | 'assignment';
  label: string;
  courseTitle: string;
  at: string;
  score?: number;
  passed?: boolean;
}

export const enrollmentsApi = {
  async enroll(courseId: string) {
    const res = await apiClient.post(`/courses/${courseId}/enroll`);
    return res.data.data;
  },

  async listMine() {
    const res = await apiClient.get<{ data: MyEnrollment[] }>('/enrollments/mine');
    return res.data.data;
  },

  async getLearningContent(courseId: string) {
    const res = await apiClient.get<{ data: LearningContent }>(`/courses/${courseId}/learn`);
    return res.data.data;
  },

  async completeLecture(lectureId: string) {
    const res = await apiClient.post(`/lectures/${lectureId}/complete`);
    return res.data.data as { totalLectures: number; completedLectures: number; percent: number; courseCompleted: boolean };
  },

  async getRecentActivity() {
    const res = await apiClient.get<{ data: RecentActivityItem[] }>('/enrollments/mine/activity');
    return res.data.data;
  },
};
