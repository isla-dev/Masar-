import { apiClient } from './client';

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  teacherName: string;
  certificateNumber: string;
  pdfUrl: string;
  issuedAt: string;
}

export interface VerificationResult {
  valid: boolean;
  certificateNumber?: string;
  studentName?: string;
  courseTitle?: string;
  teacherName?: string;
  issuedAt?: string;
}

export const certificatesApi = {
  async listMine() {
    const res = await apiClient.get<{ data: Certificate[] }>('/certificates/mine');
    return res.data.data;
  },

  async verify(certificateNumber: string) {
    const res = await apiClient.get<{ data: VerificationResult }>(`/certificates/verify/${certificateNumber}`);
    return res.data.data;
  },
};
