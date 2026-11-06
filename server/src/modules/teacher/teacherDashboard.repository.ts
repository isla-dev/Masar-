import { query } from '../../config/db';

export const teacherDashboardRepository = {
  async getCourseCounts(teacherId: string) {
    const result = await query<{
      total: string;
      published: string;
      draft: string;
      pending: string;
      rejected: string;
    }>(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'published') AS published,
         COUNT(*) FILTER (WHERE status = 'draft') AS draft,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending,
         COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
       FROM courses WHERE teacher_id = $1`,
      [teacherId]
    );
    return result.rows[0];
  },

  async getStudentStats(teacherId: string) {
    const result = await query<{ total_students: string; completion_rate: string | null }>(
      `SELECT
         COUNT(DISTINCT e.student_id) AS total_students,
         AVG(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS completion_rate
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE c.teacher_id = $1`,
      [teacherId]
    );
    return result.rows[0];
  },

  async getRecentEnrollments(teacherId: string, limit = 5) {
    const result = await query(
      `SELECT e.enrolled_at, u.full_name AS student_name, c.title AS course_title, c.id AS course_id
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN users u ON u.id = e.student_id
       WHERE c.teacher_id = $1
       ORDER BY e.enrolled_at DESC
       LIMIT $2`,
      [teacherId, limit]
    );
    return result.rows;
  },

  async getRecentSubmissions(teacherId: string, limit = 5) {
    const result = await query(
      `SELECT sub.id, sub.submitted_at, sub.grade, u.full_name AS student_name,
              a.title AS assignment_title, a.id AS assignment_id, c.title AS course_title
       FROM assignment_submissions sub
       JOIN assignments a ON a.id = sub.assignment_id
       JOIN sections s ON s.id = a.section_id
       JOIN courses c ON c.id = s.course_id
       JOIN users u ON u.id = sub.student_id
       WHERE c.teacher_id = $1
       ORDER BY sub.submitted_at DESC
       LIMIT $2`,
      [teacherId, limit]
    );
    return result.rows;
  },

  /** Enrolled students + progress for one owned course. */
  async getEnrolledStudents(courseId: string, teacherId: string) {
    const owned = await query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, teacherId]);
    if (!owned.rows[0]) return null;

    const result = await query(
      `SELECT
         e.id AS enrollment_id, e.status, e.enrolled_at, e.completed_at,
         u.id AS student_id, u.full_name AS student_name, u.email AS student_email,
         COALESCE(total.lecture_count, 0) AS total_lectures,
         COALESCE(done.completed_count, 0) AS completed_lectures
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN (
         SELECT s.course_id, COUNT(l.id) AS lecture_count
         FROM sections s JOIN lectures l ON l.section_id = s.id
         WHERE s.course_id = $1
         GROUP BY s.course_id
       ) total ON total.course_id = e.course_id
       LEFT JOIN (
         SELECT cp.enrollment_id, COUNT(*) AS completed_count
         FROM course_progress cp
         GROUP BY cp.enrollment_id
       ) done ON done.enrollment_id = e.id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );
    return result.rows;
  },
};
