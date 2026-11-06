import { apiClient } from './client';

export const paymentsApi = {
  async checkout(courseId: string, paymentMethod: 'cib' | 'edahabia') {
    const res = await apiClient.post<{ data: { checkoutUrl: string } }>(`/courses/${courseId}/checkout`, {
      paymentMethod,
    });
    return res.data.data;
  },
};
