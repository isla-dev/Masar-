import { AppError } from '../../utils/AppError';
import { quizzesRepository } from './quizzes.repository';
import { CreateQuizInput, SubmitAttemptInput, UpdateQuizMetaInput } from './quizzes.validation';

function serializeQuizMeta(row: any) {
  return {
    id: row.id,
    sectionId: row.section_id,
    title: row.title,
    passingScore: row.passing_score,
    orderIndex: row.order_index,
    questionCount: row.question_count !== undefined ? Number(row.question_count) : undefined,
  };
}

function groupQuestionRows(rows: any[]) {
  const map = new Map<string, any>();
  for (const row of rows) {
    if (!map.has(row.question_id)) {
      map.set(row.question_id, {
        id: row.question_id,
        questionText: row.question_text,
        type: row.type,
        order: row.question_order,
        answers: [] as unknown[],
      });
    }
    if (row.answer_id) {
      map.get(row.question_id).answers.push({
        id: row.answer_id,
        answerText: row.answer_text,
        order: row.answer_order,
        ...(row.is_correct !== undefined ? { isCorrect: row.is_correct } : {}),
      });
    }
  }
  return Array.from(map.values());
}

export const quizzesService = {
  async create(sectionId: string, teacherId: string, input: CreateQuizInput) {
    const owned = await quizzesRepository.findSectionIfOwned(sectionId, teacherId);
    if (!owned) throw AppError.notFound('Section not found');

    const quiz = await quizzesRepository.createWithQuestions(
      sectionId,
      input.title,
      input.passingScore,
      input.questions
    );
    return serializeQuizMeta(quiz);
  },

  async listForSection(sectionId: string, teacherId: string) {
    const owned = await quizzesRepository.findSectionIfOwned(sectionId, teacherId);
    if (!owned) throw AppError.notFound('Section not found');

    const rows = await quizzesRepository.findByOwnedSection(sectionId, teacherId);
    return rows.map(serializeQuizMeta);
  },

  async getOwnedWithQuestions(quizId: string, teacherId: string) {
    const result = await quizzesRepository.findOwnedByIdWithQuestions(quizId, teacherId);
    if (!result) throw AppError.notFound('Quiz not found');
    return { ...serializeQuizMeta(result.quiz), questions: groupQuestionRows(result.rows) };
  },

  async updateMeta(quizId: string, teacherId: string, input: UpdateQuizMetaInput) {
    const row = await quizzesRepository.updateMetaOwned(quizId, teacherId, input);
    if (!row) throw AppError.notFound('Quiz not found');
    return serializeQuizMeta(row);
  },

  async replaceQuestions(quizId: string, teacherId: string, questions: CreateQuizInput['questions']) {
    const row = await quizzesRepository.replaceQuestionsOwned(quizId, teacherId, questions);
    if (!row) throw AppError.notFound('Quiz not found');
    return this.getOwnedWithQuestions(quizId, teacherId);
  },

  async remove(quizId: string, teacherId: string) {
    const deleted = await quizzesRepository.deleteOwned(quizId, teacherId);
    if (!deleted) throw AppError.notFound('Quiz not found');
  },

  // --- Student-facing ---

  async getForAttempt(quizId: string, studentId: string) {
    const enrollment = await quizzesRepository.findEnrollmentForQuiz(quizId, studentId);
    if (!enrollment) throw AppError.forbidden('You are not enrolled in the course this quiz belongs to');

    const result = await quizzesRepository.findQuizForAttempt(quizId);
    if (!result) throw AppError.notFound('Quiz not found');

    const attempts = await quizzesRepository.findAttemptsForStudent(quizId, studentId);

    return {
      ...serializeQuizMeta(result.quiz),
      questions: groupQuestionRows(result.rows),
      previousAttempts: attempts.map((a) => ({
        id: a.id,
        score: a.score,
        passed: a.passed,
        attemptedAt: a.attempted_at,
      })),
    };
  },

  async getResultsForStudent(studentId: string) {
    const rows = await quizzesRepository.findResultsForStudent(studentId);
    return rows.map((r: any) => ({
      quizId: r.quiz_id,
      quizTitle: r.quiz_title,
      passingScore: r.passing_score,
      courseId: r.course_id,
      courseTitle: r.course_title,
      bestScore: Number(r.best_score),
      passed: r.passed,
      attemptCount: Number(r.attempt_count),
      lastAttemptedAt: r.last_attempted_at,
    }));
  },

  async submitAttempt(quizId: string, studentId: string, input: SubmitAttemptInput) {    const enrollment = await quizzesRepository.findEnrollmentForQuiz(quizId, studentId);
    if (!enrollment) throw AppError.forbidden('You are not enrolled in the course this quiz belongs to');

    const totalQuestions = await quizzesRepository.countQuestions(quizId);
    if (totalQuestions === 0) throw AppError.notFound('Quiz has no questions');

    const correctSets = await quizzesRepository.getCorrectAnswerSets(quizId);

    let correctCount = 0;
    for (const answer of input.answers) {
      const correctSet = correctSets.get(answer.questionId);
      if (!correctSet) continue;
      const submittedSet = new Set(answer.answerIds);
      const isExactMatch =
        submittedSet.size === correctSet.size && [...submittedSet].every((id) => correctSet.has(id));
      if (isExactMatch) correctCount++;
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

    const quizMeta = await quizzesRepository.findQuizForAttempt(quizId);
    const passingScore = quizMeta!.quiz.passing_score;
    const passed = score >= passingScore;

    const attempt = await quizzesRepository.recordAttempt(quizId, studentId, score, passed);

    return {
      id: attempt.id,
      score,
      passed,
      correctCount,
      totalQuestions,
      attemptedAt: attempt.attempted_at,
    };
  },
};
