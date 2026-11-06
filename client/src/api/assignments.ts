import { apiClient } from './client';

export interface AssignmentMeta {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  orderIndex: number;
  submissionCount?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  fileUrl: string | null;
  submissionText: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
}

export interface AssignmentResult {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  maxScore: number;
  courseId: string;
  courseTitle: string;
  submittedAt: string;
  grade: number | null;
  graded: boolean;
}

export const assignmentsApi = {
  // Teacher
  async listForSection(sectionId: string) {
    const res = await apiClient.get<{ data: AssignmentMeta[] }>(`/sections/${sectionId}/assignments`);
    return res.data.data;
  },
  async create(sectionId: string, input: { title: string; description?: string; dueDate?: string; maxScore: number }) {
    const res = await apiClient.post<{ data: AssignmentMeta }>(`/sections/${sectionId}/assignments`, input);
    return res.data.data;
  },
  async remove(id: string) {
    await apiClient.delete(`/assignments/${id}`);
  },
  async listSubmissions(assignmentId: string) {
    const res = await apiClient.get<{ data: Submission[] }>(`/assignments/${assignmentId}/submissions`);
    return res.data.data;
  },
  async gradeSubmission(submissionId: string, grade: number, feedback?: string) {
    const res = await apiClient.patch<{ data: Submission }>(`/submissions/${submissionId}/grade`, {
      grade,
      feedback,
    });
    return res.data.data;
  },

  // Student
  async getForSubmission(assignmentId: string) {
    const res = await apiClient.get<{ data: AssignmentMeta & { mySubmission: Submission | null } }>(
      `/assignments/${assignmentId}/submission`
    );
    return res.data.data;
  },
  async submit(assignmentId: string, data: { submissionText?: string; file?: File }) {
    const formData = new FormData();
    if (data.submissionText) formData.append('submissionText', data.submissionText);
    if (data.file) formData.append('file', data.file);
    const res = await apiClient.post<{ data: Submission }>(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  async getResultsForStudent() {
    const res = await apiClient.get<{ data: AssignmentResult[] }>('/assignments/results/mine');
    return res.data.data;
  },
};
