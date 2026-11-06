import { query } from '../../config/db';

export interface CreateAssignmentInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxScore: number;
}

export const assignmentsRepository = {
  async findSectionIfOwned(sectionId: string, teacherId: string) {
    const result = await query(
      `SELECT s.id FROM sections s JOIN courses c ON c.id = s.course_id
       WHERE s.id = $1 AND c.teacher_id = $2`,
      [sectionId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async create(sectionId: string, input: CreateAssignmentInput) {
    const orderResult = await query<{ next_order: number }>(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM assignments WHERE section_id = $1`,
      [sectionId]
    );
    const nextOrder = orderResult.rows[0].next_order;

    const result = await query(
      `INSERT INTO assignments (section_id, title, description, due_date, max_score, order_index)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [sectionId, input.title, input.description ?? null, input.dueDate ?? null, input.maxScore, nextOrder]
    );
    return result.rows[0];
  },

  async findByOwnedSection(sectionId: string, teacherId: string) {
    const result = await query(
      `SELECT a.*, COALESCE(sc.submission_count, 0) AS submission_count
       FROM assignments a
       JOIN sections s ON s.id = a.section_id
       JOIN courses c ON c.id = s.course_id
       LEFT JOIN (
         SELECT assignment_id, COUNT(*) AS submission_count FROM assignment_submissions GROUP BY assignment_id
       ) sc ON sc.assignment_id = a.id
       WHERE a.section_id = $1 AND c.teacher_id = $2
       ORDER BY a.order_index ASC`,
      [sectionId, teacherId]
    );
    return result.rows;
  },

  async findOwnedById(assignmentId: string, teacherId: string) {
    const result = await query(
      `SELECT a.* FROM assignments a
       JOIN sections s ON s.id = a.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE a.id = $1 AND c.teacher_id = $2`,
      [assignmentId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async updateOwned(assignmentId: string, teacherId: string, input: Partial<CreateAssignmentInput>) {
    const fields: string[] = [];
    const values: unknown[] = [];
    const fieldMap: Record<string, unknown> = {
      title: input.title,
      description: input.description,
      due_date: input.dueDate,
      max_score: input.maxScore,
    };
    for (const [column, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    }
    if (fields.length === 0) return this.findOwnedById(assignmentId, teacherId);

    values.push(assignmentId, teacherId);
    const result = await query(
      `UPDATE assignments a SET ${fields.join(', ')}
       FROM sections s, courses c
       WHERE a.section_id = s.id AND s.course_id = c.id
         AND a.id = $${values.length - 1} AND c.teacher_id = $${values.length}
       RETURNING a.*`,
      values
    );
    return result.rows[0] ?? null;
  },

  async deleteOwned(assignmentId: string, teacherId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM assignments a USING sections s, courses c
       WHERE a.section_id = s.id AND s.course_id = c.id
         AND a.id = $1 AND c.teacher_id = $2`,
      [assignmentId, teacherId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  async findSubmissionsForOwnedAssignment(assignmentId: string, teacherId: string) {
    const owned = await this.findOwnedById(assignmentId, teacherId);
    if (!owned) return null;

    const result = await query(
      `SELECT sub.*, u.full_name AS student_name, u.email AS student_email
       FROM assignment_submissions sub
       JOIN users u ON u.id = sub.student_id
       WHERE sub.assignment_id = $1
       ORDER BY sub.submitted_at DESC`,
      [assignmentId]
    );
    return result.rows;
  },

  async gradeSubmissionOwned(submissionId: string, teacherId: string, grade: number, feedback: string | null) {
    const result = await query(
      `UPDATE assignment_submissions sub SET grade = $1, feedback = $2, graded_at = now()
       FROM assignments a, sections s, courses c
       WHERE sub.assignment_id = a.id AND a.section_id = s.id AND s.course_id = c.id
         AND sub.id = $3 AND c.teacher_id = $4
       RETURNING sub.*`,
      [grade, feedback, submissionId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  // --- Student-facing ---

  async findEnrollmentForAssignment(assignmentId: string, studentId: string) {
    const result = await query(
      `SELECT e.* FROM enrollments e
       JOIN assignments a ON a.id = $1
       JOIN sections s ON s.id = a.section_id
       WHERE e.course_id = s.course_id AND e.student_id = $2`,
      [assignmentId, studentId]
    );
    return result.rows[0] ?? null;
  },

  async findPublishedAssignment(assignmentId: string) {
    const result = await query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
    return result.rows[0] ?? null;
  },

  async upsertSubmission(
    assignmentId: string,
    studentId: string,
    data: { fileUrl: string | null; submissionText: string | null }
  ) {
    const result = await query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, submission_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET file_url = EXCLUDED.file_url, submission_text = EXCLUDED.submission_text,
                      submitted_at = now(), grade = NULL, feedback = NULL, graded_at = NULL
       RETURNING *`,
      [assignmentId, studentId, data.fileUrl, data.submissionText]
    );
    return result.rows[0];
  },

  async findMySubmission(assignmentId: string, studentId: string) {
    const result = await query(
      'SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, studentId]
    );
    return result.rows[0] ?? null;
  },

  /** All of the student's submissions across every course — used for the "Assignment results" dashboard section. */
  async findAllSubmissionsForStudent(studentId: string) {
    const result = await query(
      `SELECT sub.*, a.title AS assignment_title, a.max_score, c.id AS course_id, c.title AS course_title
       FROM assignment_submissions sub
       JOIN assignments a ON a.id = sub.assignment_id
       JOIN sections s ON s.id = a.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE sub.student_id = $1
       ORDER BY sub.submitted_at DESC`,
      [studentId]
    );
    return result.rows;
  },
};
