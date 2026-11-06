import { query, withTransaction } from '../../config/db';

export interface QuestionInput {
  questionText: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  answers: { answerText: string; isCorrect: boolean }[];
}

export const quizzesRepository = {
  async findSectionIfOwned(sectionId: string, teacherId: string) {
    const result = await query(
      `SELECT s.id FROM sections s JOIN courses c ON c.id = s.course_id
       WHERE s.id = $1 AND c.teacher_id = $2`,
      [sectionId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async findQuizIfOwned(quizId: string, teacherId: string) {
    const result = await query(
      `SELECT q.* FROM quizzes q
       JOIN sections s ON s.id = q.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE q.id = $1 AND c.teacher_id = $2`,
      [quizId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async createWithQuestions(sectionId: string, title: string, passingScore: number, questions: QuestionInput[]) {
    return withTransaction(async (client) => {
      const orderResult = await client.query<{ next_order: number }>(
        `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM quizzes WHERE section_id = $1`,
        [sectionId]
      );
      const nextOrder = orderResult.rows[0].next_order;

      const quizResult = await client.query(
        `INSERT INTO quizzes (section_id, title, passing_score, order_index)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [sectionId, title, passingScore, nextOrder]
      );
      const quiz = quizResult.rows[0];

      for (let qi = 0; qi < questions.length; qi++) {
        const q = questions[qi];
        const questionResult = await client.query(
          `INSERT INTO quiz_questions (quiz_id, question_text, type, order_index)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [quiz.id, q.questionText, q.type, qi]
        );
        const questionId = questionResult.rows[0].id;

        for (let ai = 0; ai < q.answers.length; ai++) {
          const a = q.answers[ai];
          await client.query(
            `INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index)
             VALUES ($1, $2, $3, $4)`,
            [questionId, a.answerText, a.isCorrect, ai]
          );
        }
      }

      return quiz;
    });
  },

  async findByOwnedSection(sectionId: string, teacherId: string) {
    const result = await query(
      `SELECT q.*, COALESCE(qc.question_count, 0) AS question_count
       FROM quizzes q
       JOIN sections s ON s.id = q.section_id
       JOIN courses c ON c.id = s.course_id
       LEFT JOIN (
         SELECT quiz_id, COUNT(*) AS question_count FROM quiz_questions GROUP BY quiz_id
       ) qc ON qc.quiz_id = q.id
       WHERE q.section_id = $1 AND c.teacher_id = $2
       ORDER BY q.order_index ASC`,
      [sectionId, teacherId]
    );
    return result.rows;
  },

  /** Full quiz with questions + answers including is_correct, for teacher editing. */
  async findOwnedByIdWithQuestions(quizId: string, teacherId: string) {
    const quiz = await this.findQuizIfOwned(quizId, teacherId);
    if (!quiz) return null;

    const rows = await query(
      `SELECT qq.id AS question_id, qq.question_text, qq.type, qq.order_index AS question_order,
              qa.id AS answer_id, qa.answer_text, qa.is_correct, qa.order_index AS answer_order
       FROM quiz_questions qq
       LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
       WHERE qq.quiz_id = $1
       ORDER BY qq.order_index ASC, qa.order_index ASC`,
      [quizId]
    );

    return { quiz, rows: rows.rows };
  },

  async updateMetaOwned(quizId: string, teacherId: string, data: { title?: string; passingScore?: number }) {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (data.title !== undefined) {
      values.push(data.title);
      fields.push(`title = $${values.length}`);
    }
    if (data.passingScore !== undefined) {
      values.push(data.passingScore);
      fields.push(`passing_score = $${values.length}`);
    }
    if (fields.length === 0) return this.findQuizIfOwned(quizId, teacherId);

    values.push(quizId, teacherId);
    const result = await query(
      `UPDATE quizzes q SET ${fields.join(', ')}
       FROM sections s, courses c
       WHERE q.section_id = s.id AND s.course_id = c.id
         AND q.id = $${values.length - 1} AND c.teacher_id = $${values.length}
       RETURNING q.*`,
      values
    );
    return result.rows[0] ?? null;
  },

  /** Replaces the full question/answer set for a quiz (delete + recreate in one transaction). */
  async replaceQuestionsOwned(quizId: string, teacherId: string, questions: QuestionInput[]) {
    const owned = await this.findQuizIfOwned(quizId, teacherId);
    if (!owned) return null;

    return withTransaction(async (client) => {
      await client.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [quizId]);

      for (let qi = 0; qi < questions.length; qi++) {
        const q = questions[qi];
        const questionResult = await client.query(
          `INSERT INTO quiz_questions (quiz_id, question_text, type, order_index)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [quizId, q.questionText, q.type, qi]
        );
        const questionId = questionResult.rows[0].id;

        for (let ai = 0; ai < q.answers.length; ai++) {
          const a = q.answers[ai];
          await client.query(
            `INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index)
             VALUES ($1, $2, $3, $4)`,
            [questionId, a.answerText, a.isCorrect, ai]
          );
        }
      }

      return owned;
    });
  },

  async deleteOwned(quizId: string, teacherId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM quizzes q USING sections s, courses c
       WHERE q.section_id = s.id AND s.course_id = c.id
         AND q.id = $1 AND c.teacher_id = $2`,
      [quizId, teacherId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  // --- Student-facing ---

  /** Verifies the student is enrolled in the course this quiz belongs to. */
  async findEnrollmentForQuiz(quizId: string, studentId: string) {
    const result = await query(
      `SELECT e.* FROM enrollments e
       JOIN quizzes q ON q.id = $1
       JOIN sections s ON s.id = q.section_id
       WHERE e.course_id = s.course_id AND e.student_id = $2`,
      [quizId, studentId]
    );
    return result.rows[0] ?? null;
  },

  async findQuizForAttempt(quizId: string) {
    const quizResult = await query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    const quiz = quizResult.rows[0];
    if (!quiz) return null;

    // Deliberately omit is_correct — the student shouldn't see answers before submitting.
    const rows = await query(
      `SELECT qq.id AS question_id, qq.question_text, qq.type, qq.order_index AS question_order,
              qa.id AS answer_id, qa.answer_text, qa.order_index AS answer_order
       FROM quiz_questions qq
       LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
       WHERE qq.quiz_id = $1
       ORDER BY qq.order_index ASC, qa.order_index ASC`,
      [quizId]
    );

    return { quiz, rows: rows.rows };
  },

  /** Returns, per question, the set of correct answer ids — used server-side for scoring. */
  async getCorrectAnswerSets(quizId: string): Promise<Map<string, Set<string>>> {
    const result = await query<{ question_id: string; answer_id: string }>(
      `SELECT qq.id AS question_id, qa.id AS answer_id
       FROM quiz_questions qq
       JOIN quiz_answers qa ON qa.question_id = qq.id
       WHERE qq.quiz_id = $1 AND qa.is_correct = true`,
      [quizId]
    );
    const map = new Map<string, Set<string>>();
    for (const row of result.rows) {
      if (!map.has(row.question_id)) map.set(row.question_id, new Set());
      map.get(row.question_id)!.add(row.answer_id);
    }
    return map;
  },

  async countQuestions(quizId: string): Promise<number> {
    const result = await query<{ count: string }>('SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = $1', [
      quizId,
    ]);
    return Number(result.rows[0].count);
  },

  async recordAttempt(quizId: string, studentId: string, score: number, passed: boolean) {
    const result = await query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, score, passed)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [quizId, studentId, score, passed]
    );
    return result.rows[0];
  },

  async findAttemptsForStudent(quizId: string, studentId: string) {
    const result = await query(
      `SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2 ORDER BY attempted_at DESC`,
      [quizId, studentId]
    );
    return result.rows;
  },

  /** Best-attempt summary per quiz, across all of the student's courses — used for the "Quiz results" dashboard section. */
  async findResultsForStudent(studentId: string) {
    const result = await query(
      `SELECT
         q.id AS quiz_id, q.title AS quiz_title, q.passing_score,
         c.id AS course_id, c.title AS course_title,
         MAX(qa.score) AS best_score, BOOL_OR(qa.passed) AS passed,
         COUNT(*) AS attempt_count, MAX(qa.attempted_at) AS last_attempted_at
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       JOIN sections s ON s.id = q.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE qa.student_id = $1
       GROUP BY q.id, q.title, q.passing_score, c.id, c.title
       ORDER BY MAX(qa.attempted_at) DESC`,
      [studentId]
    );
    return result.rows;
  },
};
