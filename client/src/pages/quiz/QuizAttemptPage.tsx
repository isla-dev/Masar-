import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { quizzesApi, QuizAttemptResult } from '../../api/quizzes';
import { Spinner } from '../../components/common/Feedback';
import { Button } from '../../components/common/Button';

export default function QuizAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz-attempt', id],
    queryFn: () => quizzesApi.getForAttempt(id!),
    enabled: Boolean(id),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      quizzesApi.submitAttempt(
        id!,
        Object.entries(selections).map(([questionId, answerIds]) => ({
          questionId,
          answerIds: Array.from(answerIds),
        }))
      ),
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ['learn'] });
    },
  });

  function toggleAnswer(questionId: string, answerId: string, multi: boolean) {
    setSelections((prev) => {
      const next = { ...prev };
      const current = new Set(next[questionId] ?? []);
      if (multi) {
        current.has(answerId) ? current.delete(answerId) : current.add(answerId);
      } else {
        current.clear();
        current.add(answerId);
      }
      next[questionId] = current;
      return next;
    });
  }

  if (isLoading || !quiz) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => (selections[q.id]?.size ?? 0) > 0);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900">{quiz.title}</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {t('quiz.passingScore')}: {quiz.passingScore}%
      </p>

      {result ? (
        <div
          className={`rounded-xl border p-6 text-center ${
            result.passed ? 'border-primary-200 bg-primary-50' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <p className="text-3xl font-bold text-neutral-900">{result.score}%</p>
          <p className="mt-1 text-neutral-600">
            {result.correctCount}/{result.totalQuestions} {t('quiz.correct')}
          </p>
          <p className={`mt-3 font-medium ${result.passed ? 'text-primary-700' : 'text-red-500'}`}>
            {result.passed ? t('quiz.passed') : t('quiz.failed')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="mb-3 font-medium text-neutral-900">
                {i + 1}. {q.questionText}
              </p>
              <div className="flex flex-col gap-2">
                {q.answers.map((a) => {
                  const multi = q.type === 'multiple_choice';
                  const checked = selections[q.id]?.has(a.id) ?? false;
                  return (
                    <label key={a.id} className="flex items-center gap-2 text-sm text-neutral-700">
                      <input
                        type={multi ? 'checkbox' : 'radio'}
                        name={q.id}
                        checked={checked}
                        onChange={() => toggleAnswer(q.id, a.id, multi)}
                      />
                      {a.answerText}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <Button disabled={!allAnswered || submitMutation.isPending} onClick={() => submitMutation.mutate()}>
            {t('quiz.submit')}
          </Button>
        </div>
      )}

      {quiz.previousAttempts.length > 0 && !result && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">{t('quiz.previousAttempts')}</h2>
          <ul className="flex flex-col gap-1 text-sm text-neutral-500">
            {quiz.previousAttempts.map((a) => (
              <li key={a.id}>
                {a.score}% — {a.passed ? t('quiz.passed') : t('quiz.failed')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
