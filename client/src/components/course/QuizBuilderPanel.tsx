import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizzesApi, QuestionInput, QuestionType } from '../../api/quizzes';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

function emptyQuestion(): QuestionInput {
  return {
    questionText: '',
    type: 'single_choice',
    answers: [
      { answerText: '', isCorrect: true },
      { answerText: '', isCorrect: false },
    ],
  };
}

function QuizForm({ sectionId, onDone }: { sectionId: string; onDone: () => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()]);

  const createMutation = useMutation({
    mutationFn: () => quizzesApi.create(sectionId, title, passingScore, questions),
    onSuccess: onDone,
  });

  function updateQuestion(qi: number, patch: Partial<QuestionInput>) {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }

  function updateAnswer(qi: number, ai: number, patch: Partial<QuestionInput['answers'][number]>) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const answers = q.answers.map((a, j) => {
          if (j !== ai) {
            // For single-choice/true-false, selecting one correct answer clears the others.
            if (patch.isCorrect && q.type !== 'multiple_choice') return { ...a, isCorrect: false };
            return a;
          }
          return { ...a, ...patch };
        });
        return { ...q, answers };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }
  function removeQuestion(qi: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  }
  function addAnswer(qi: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, answers: [...q.answers, { answerText: '', isCorrect: false }] } : q))
    );
  }
  function removeAnswer(qi: number, ai: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q))
    );
  }

  const isValid =
    title.trim() &&
    questions.length > 0 &&
    questions.every((q) => q.questionText.trim() && q.answers.length >= 2 && q.answers.some((a) => a.isCorrect));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3">
      <Input placeholder={t('quiz.quizTitle')} value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input
        type="number"
        min={0}
        max={100}
        label={t('quiz.passingScore')}
        value={passingScore}
        onChange={(e) => setPassingScore(Number(e.target.value))}
        className="w-32"
      />

      {questions.map((q, qi) => (
        <div key={qi} className="rounded-lg bg-neutral-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Input
              placeholder={t('quiz.questionText')}
              value={q.questionText}
              onChange={(e) => updateQuestion(qi, { questionText: e.target.value })}
              className="flex-1"
            />
            <Select
              value={q.type}
              onChange={(e) => updateQuestion(qi, { type: e.target.value as QuestionType })}
              options={[
                { value: 'single_choice', label: t('quiz.singleChoice') },
                { value: 'multiple_choice', label: t('quiz.multipleChoice') },
                { value: 'true_false', label: t('quiz.trueFalse') },
              ]}
            />
            <button type="button" className="text-neutral-400 hover:text-red-500" onClick={() => removeQuestion(qi)}>
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {q.answers.map((a, ai) => (
              <div key={ai} className="flex items-center gap-2">
                <input
                  type={q.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                  name={`correct-${qi}`}
                  checked={a.isCorrect}
                  onChange={(e) => updateAnswer(qi, ai, { isCorrect: e.target.checked })}
                />
                <Input
                  placeholder={t('quiz.answerText')}
                  value={a.answerText}
                  onChange={(e) => updateAnswer(qi, ai, { answerText: e.target.value })}
                  className="flex-1"
                />
                <button
                  type="button"
                  className="text-xs text-neutral-400 hover:text-red-500"
                  onClick={() => removeAnswer(qi, ai)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-1 self-start text-xs font-medium text-primary-600 hover:underline"
              onClick={() => addAnswer(qi)}
            >
              {t('quiz.addAnswer')}
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="self-start text-sm font-medium text-primary-600 hover:underline" onClick={addQuestion}>
        {t('quiz.addQuestion')}
      </button>

      <div className="flex gap-2">
        <Button disabled={!isValid || createMutation.isPending} onClick={() => createMutation.mutate()}>
          {t('common.save')}
        </Button>
        <Button variant="ghost" onClick={onDone} type="button">
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}

export function QuizBuilderPanel({ sectionId }: { sectionId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes', sectionId],
    queryFn: () => quizzesApi.listForSection(sectionId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizzesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes', sectionId] }),
  });

  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">{t('quiz.quizzes')}</p>
      <ul className="flex flex-col gap-1">
        {quizzes?.map((quiz) => (
          <li key={quiz.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
            <span>
              {quiz.title} · {quiz.questionCount} {t('quiz.questions')}
            </span>
            <button
              type="button"
              className="text-xs text-neutral-400 hover:text-red-500"
              onClick={() => deleteMutation.mutate(quiz.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {isAdding ? (
        <div className="mt-2">
          <QuizForm
            sectionId={sectionId}
            onDone={() => {
              setIsAdding(false);
              queryClient.invalidateQueries({ queryKey: ['quizzes', sectionId] });
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-primary-600 hover:underline"
          onClick={() => setIsAdding(true)}
        >
          {t('quiz.newQuiz')}
        </button>
      )}
    </div>
  );
}
