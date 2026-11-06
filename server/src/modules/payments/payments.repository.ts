import { query } from '../../config/db';

export const paymentsRepository = {
  async create(data: {
    studentId: string;
    courseId: string;
    amount: number;
    currency: string;
    provider: string;
  }) {
    const result = await query(
      `INSERT INTO payments (student_id, course_id, amount, currency, provider, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [data.studentId, data.courseId, data.amount, data.currency, data.provider]
    );
    return result.rows[0];
  },

  async setProviderReference(paymentId: string, providerTransactionId: string, metadata: Record<string, unknown>) {
    await query(
      `UPDATE payments SET provider_transaction_id = $2, provider_metadata = $3, updated_at = now() WHERE id = $1`,
      [paymentId, providerTransactionId, JSON.stringify(metadata)]
    );
  },

  async findByProviderReference(providerTransactionId: string) {
    const result = await query('SELECT * FROM payments WHERE provider_transaction_id = $1', [
      providerTransactionId,
    ]);
    return result.rows[0] ?? null;
  },

  async findById(id: string) {
    const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async markStatus(paymentId: string, status: 'completed' | 'failed') {
    await query('UPDATE payments SET status = $2, updated_at = now() WHERE id = $1', [paymentId, status]);
  },

  async findCourse(courseId: string) {
    const result = await query('SELECT * FROM courses WHERE id = $1 AND status = $2', [courseId, 'published']);
    return result.rows[0] ?? null;
  },

  async findExistingEnrollment(studentId: string, courseId: string) {
    const result = await query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [
      studentId,
      courseId,
    ]);
    return result.rows[0] ?? null;
  },

  async createEnrollment(studentId: string, courseId: string) {
    await query(
      `INSERT INTO enrollments (student_id, course_id, status)
       VALUES ($1, $2, 'active')
       ON CONFLICT (student_id, course_id) DO NOTHING`,
      [studentId, courseId]
    );
  },
};
