import { query } from '../../config/db';

export const certificatesRepository = {
  async findByStudentAndCourse(studentId: string, courseId: string) {
    const result = await query('SELECT * FROM certificates WHERE student_id = $1 AND course_id = $2', [
      studentId,
      courseId,
    ]);
    return result.rows[0] ?? null;
  },

  async create(data: {
    studentId: string;
    courseId: string;
    certificateNumber: string;
    pdfUrl: string;
  }) {
    const result = await query(
      `INSERT INTO certificates (student_id, course_id, certificate_number, pdf_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.studentId, data.courseId, data.certificateNumber, data.pdfUrl]
    );
    return result.rows[0];
  },

  /** Snapshot of everything needed to render the certificate, at generation time. */
  async getGenerationData(studentId: string, courseId: string) {
    const result = await query(
      `SELECT
         u.full_name AS student_name,
         c.title AS course_title,
         t.full_name AS teacher_name,
         e.completed_at
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       JOIN users t ON t.id = c.teacher_id
       WHERE e.student_id = $1 AND e.course_id = $2`,
      [studentId, courseId]
    );
    return result.rows[0] ?? null;
  },

  async findMine(studentId: string) {
    const result = await query(
      `SELECT cert.*, c.title AS course_title, u.full_name AS teacher_name
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = c.teacher_id
       WHERE cert.student_id = $1
       ORDER BY cert.issued_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  /** Public lookup for the verification page — no ownership check, by design. */
  async findByCertificateNumber(certificateNumber: string) {
    const result = await query(
      `SELECT cert.*, u.full_name AS student_name, c.title AS course_title, t.full_name AS teacher_name
       FROM certificates cert
       JOIN users u ON u.id = cert.student_id
       JOIN courses c ON c.id = cert.course_id
       JOIN users t ON t.id = c.teacher_id
       WHERE cert.certificate_number = $1`,
      [certificateNumber]
    );
    return result.rows[0] ?? null;
  },
};
