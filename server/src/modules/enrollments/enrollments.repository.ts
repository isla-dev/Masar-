import { query } from '../../config/db';

export const enrollmentsRepository = {
  async findByStudentAndCourse(studentId: string, courseId: string) {
    const result = await query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    return result.rows[0] ?? null;
  },

  async create(studentId: string, courseId: string) {
    const result = await query(
      `INSERT INTO enrollments (student_id, course_id, status)
       VALUES ($1, $2, 'active')
       RETURNING *`,
      [studentId, courseId]
    );
    return result.rows[0];
  },

  async findMineWithProgress(studentId: string) {
    const result = await query(
      `SELECT
         e.id AS enrollment_id, e.status AS enrollment_status, e.enrolled_at, e.completed_at,
         c.id AS course_id, c.title, c.thumbnail_url, c.level,
         u.full_name AS teacher_name,
         COALESCE(total.lecture_count, 0) AS total_lectures,
         COALESCE(done.completed_count, 0) AS completed_lectures
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN (
         SELECT s.course_id, COUNT(l.id) AS lecture_count
         FROM sections s JOIN lectures l ON l.section_id = s.id
         GROUP BY s.course_id
       ) total ON total.course_id = c.id
       LEFT JOIN (
         SELECT s.course_id, COUNT(cp.id) AS completed_count
         FROM course_progress cp
         JOIN enrollments e2 ON e2.id = cp.enrollment_id
         JOIN lectures l ON l.id = cp.lecture_id
         JOIN sections s ON s.id = l.section_id
         WHERE e2.student_id = $1
         GROUP BY s.course_id
       ) done ON done.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  /** Course row only if published — used to validate enrollment eligibility. */
  async findPublishedCourse(courseId: string) {
    const result = await query(`SELECT * FROM courses WHERE id = $1 AND status = 'published'`, [courseId]);
    return result.rows[0] ?? null;
  },

  /** Full curriculum including content_url — only called after enrollment is verified. */
  async getCurriculumForLearning(courseId: string) {
    const result = await query(
      `SELECT
         s.id AS section_id, s.title AS section_title, s.order_index AS section_order,
         l.id AS lecture_id, l.title AS lecture_title, l.content_type, l.content_url,
         l.duration_seconds, l.order_index AS lecture_order
       FROM sections s
       LEFT JOIN lectures l ON l.section_id = s.id
       WHERE s.course_id = $1
       ORDER BY s.order_index ASC, l.order_index ASC`,
      [courseId]
    );
    return result.rows;
  },

  async getCompletedLectureIds(enrollmentId: string): Promise<string[]> {
    const result = await query<{ lecture_id: string }>(
      'SELECT lecture_id FROM course_progress WHERE enrollment_id = $1',
      [enrollmentId]
    );
    return result.rows.map((r) => r.lecture_id);
  },

  /** Verifies the lecture belongs to courseId and the student is enrolled in it. Returns the enrollment or null. */
  async findEnrollmentForLecture(lectureId: string, studentId: string) {
    const result = await query(
      `SELECT e.* FROM enrollments e
       JOIN lectures l ON l.id = $1
       JOIN sections s ON s.id = l.section_id
       WHERE e.course_id = s.course_id AND e.student_id = $2`,
      [lectureId, studentId]
    );
    return result.rows[0] ?? null;
  },

  async getQuizzesForCourse(courseId: string, studentId: string) {
    const result = await query(
      `SELECT
         q.id, q.section_id, q.title, q.passing_score, q.order_index,
         best.best_score, best.passed AS best_passed, best.attempt_count
       FROM quizzes q
       JOIN sections s ON s.id = q.section_id
       LEFT JOIN (
         SELECT quiz_id,
                MAX(score) AS best_score,
                BOOL_OR(passed) AS passed,
                COUNT(*) AS attempt_count
         FROM quiz_attempts
         WHERE student_id = $2
         GROUP BY quiz_id
       ) best ON best.quiz_id = q.id
       WHERE s.course_id = $1
       ORDER BY q.order_index ASC`,
      [courseId, studentId]
    );
    return result.rows;
  },

  async getAssignmentsForCourse(courseId: string, studentId: string) {
    const result = await query(
      `SELECT
         a.id, a.section_id, a.title, a.due_date, a.max_score, a.order_index,
         sub.grade, sub.submitted_at, sub.graded_at
       FROM assignments a
       JOIN sections s ON s.id = a.section_id
       LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = $2
       WHERE s.course_id = $1
       ORDER BY a.order_index ASC`,
      [courseId, studentId]
    );
    return result.rows;
  },

  async markLectureComplete(enrollmentId: string, lectureId: string) {
    await query(
      `INSERT INTO course_progress (enrollment_id, lecture_id)
       VALUES ($1, $2)
       ON CONFLICT (enrollment_id, lecture_id) DO NOTHING`,
      [enrollmentId, lectureId]
    );
  },

  async countProgress(enrollmentId: string, courseId: string) {
    const result = await query<{ total: string; completed: string }>(
      `SELECT
         (SELECT COUNT(*) FROM lectures l JOIN sections s ON s.id = l.section_id WHERE s.course_id = $2) AS total,
         (SELECT COUNT(*) FROM course_progress WHERE enrollment_id = $1) AS completed`,
      [enrollmentId, courseId]
    );
    return {
      total: Number(result.rows[0].total),
      completed: Number(result.rows[0].completed),
    };
  },

  async markEnrollmentCompleted(enrollmentId: string) {
    await query(
      `UPDATE enrollments SET status = 'completed', completed_at = now()
       WHERE id = $1 AND status != 'completed'`,
      [enrollmentId]
    );
  },

  /** Recent lecture completions, quiz attempts, and assignment submissions, merged and capped — for the "Recent activity" dashboard section. */
  async getRecentActivity(studentId: string, limit = 10) {
    const [lectures, quizzes, submissions] = await Promise.all([
      query(
        `SELECT cp.completed_at AS at, l.title AS label, c.title AS course_title, 'lecture' AS type
         FROM course_progress cp
         JOIN enrollments e ON e.id = cp.enrollment_id
         JOIN lectures l ON l.id = cp.lecture_id
         JOIN sections s ON s.id = l.section_id
         JOIN courses c ON c.id = s.course_id
         WHERE e.student_id = $1
         ORDER BY cp.completed_at DESC LIMIT $2`,
        [studentId, limit]
      ),
      query(
        `SELECT qa.attempted_at AS at, q.title AS label, c.title AS course_title, 'quiz' AS type, qa.score, qa.passed
         FROM quiz_attempts qa
         JOIN quizzes q ON q.id = qa.quiz_id
         JOIN sections s ON s.id = q.section_id
         JOIN courses c ON c.id = s.course_id
         WHERE qa.student_id = $1
         ORDER BY qa.attempted_at DESC LIMIT $2`,
        [studentId, limit]
      ),
      query(
        `SELECT sub.submitted_at AS at, a.title AS label, c.title AS course_title, 'assignment' AS type
         FROM assignment_submissions sub
         JOIN assignments a ON a.id = sub.assignment_id
         JOIN sections s ON s.id = a.section_id
         JOIN courses c ON c.id = s.course_id
         WHERE sub.student_id = $1
         ORDER BY sub.submitted_at DESC LIMIT $2`,
        [studentId, limit]
      ),
    ]);

    return [...lectures.rows, ...quizzes.rows, ...submissions.rows]
      .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, limit);
  },
};
