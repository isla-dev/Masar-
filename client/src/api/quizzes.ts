import { apiClient } from './client';

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface AnswerInput {
  answerText: string;
  isCorrect: boolean;
}

export interface QuestionInput {
  questionText: string;
  type: QuestionType;
  answers: AnswerInput[];
}

export interface QuizMeta {
  id: string;
  sectionId: string;
  title: string;
  passingScore: number;
  orderIndex: number;
  questionCount?: number;
}

export interface QuizWithQuestions extends QuizMeta {
  questions: {
    id: string;
    questionText: string;
    type: QuestionType;
    order: number;
    answers: { id: string; answerText: string; order: number; isCorrect?: boolean }[];
  }[];
}

export interface QuizAttemptResult {
  id: string;
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  attemptedAt: string;
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  passingScore: number;
  courseId: string;
  courseTitle: string;
  bestScore: number;
  passed: boolean;
  attemptCount: number;
  lastAttemptedAt: string;
}

export const quizzesApi = {
  // Teacher
  async listForSection(sectionId: string) {
    const res = await apiClient.get<{ data: QuizMeta[] }>(`/sections/${sectionId}/quizzes`);
    return res.data.data;
  },
  async create(sectionId: string, title: string, passingScore: number, questions: QuestionInput[]) {
    const res = await apiClient.post<{ data: QuizMeta }>(`/sections/${sectionId}/quizzes`, {
      title,
      passingScore,
      questions,
    });
    return res.data.data;
  },
  async remove(quizId: string) {
    await apiClient.delete(`/quizzes/${quizId}`);
  },
  async getOwned(quizId: string) {
    const res = await apiClient.get<{ data: QuizWithQuestions }>(`/quizzes/${quizId}`);
    return res.data.data;
  },

  // Student
  async getForAttempt(quizId: string) {
    const res = await apiClient.get<{
      data: QuizWithQuestions & { previousAttempts: QuizAttemptResult[] };
    }>(`/quizzes/${quizId}/attempt`);
    return res.data.data;
  },
  async submitAttempt(quizId: string, answers: { questionId: string; answerIds: string[] }[]) {
    const res = await apiClient.post<{ data: QuizAttemptResult }>(`/quizzes/${quizId}/attempt`, { answers });
    return res.data.data;
  },
  async getResultsForStudent() {
    const res = await apiClient.get<{ data: QuizResult[] }>('/quizzes/results/mine');
    return res.data.data;
  },
};
