import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { enrollmentsApi, LearningLecture } from '../api/enrollments';
import { Spinner, Badge } from '../components/common/Feedback';
import { Button } from '../components/common/Button';

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['learn', courseId],
    queryFn: () => enrollmentsApi.getLearningContent(courseId!),
    enabled: Boolean(courseId),
  });

  // Default to the first incomplete lecture (or the first lecture overall) once loaded.
  useEffect(() => {
    if (data && !activeLectureId) {
      const allLectures = data.curriculum.flatMap((s) => s.lectures);
      const firstIncomplete = allLectures.find((l) => !l.completed);
      setActiveLectureId((firstIncomplete ?? allLectures[0])?.id ?? null);
    }
  }, [data, activeLectureId]);

  const completeMutation = useMutation({
    mutationFn: (lectureId: string) => enrollmentsApi.completeLecture(lectureId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learn', courseId] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="py-24 text-center text-red-500">{t('common.errorLoading')}</p>;
  }

  const activeLecture: LearningLecture | undefined = data.curriculum
    .flatMap((s) => s.lectures)
    .find((l) => l.id === activeLectureId);

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <aside className="w-72 shrink-0 rounded-xl border border-neutral-200 bg-white p-4">
        <h1 className="font-semibold text-neutral-900">{data.course.title}</h1>

        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${data.progress.percent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {data.progress.completedLectures}/{data.progress.totalLectures} · {data.progress.percent}%
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {data.curriculum.map((section) => (
            <div key={section.id}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {section.title}
              </p>
              <ul className="flex flex-col gap-1">
                {section.lectures.map((lecture) => (
                  <li key={lecture.id}>
                    <button
                      onClick={() => setActiveLectureId(lecture.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm ${
                        lecture.id === activeLectureId
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                          lecture.completed ? 'border-primary-500 bg-primary-500' : 'border-neutral-300'
                        }`}
                      />
                      {lecture.title}
                    </button>
                  </li>
                ))}
              </ul>

              {section.quizzes.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1">
                  {section.quizzes.map((quiz) => (
                    <li key={quiz.id}>
                      <Link
                        to={`/quiz/${quiz.id}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <span>📝 {quiz.title}</span>
                        {quiz.attemptCount > 0 && (
                          <Badge tone={quiz.passed ? 'primary' : 'neutral'}>
                            {quiz.bestScore}%
                          </Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {section.assignments.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1">
                  {section.assignments.map((assignment) => (
                    <li key={assignment.id}>
                      <Link
                        to={`/assignment/${assignment.id}`}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <span>📎 {assignment.title}</span>
                        {assignment.graded && <Badge tone="primary">{assignment.grade}/{assignment.maxScore}</Badge>}
                        {assignment.submitted && !assignment.graded && (
                          <Badge tone="neutral">{t('learn.awaitingGrade')}</Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 rounded-xl border border-neutral-200 bg-white p-6">
        {activeLecture ? (
          <>
            <h2 className="text-xl font-semibold text-neutral-900">{activeLecture.title}</h2>

            <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
              {activeLecture.contentType === 'video' && activeLecture.contentUrl ? (
                <video src={activeLecture.contentUrl} controls className="h-full w-full" />
              ) : activeLecture.contentType === 'file' && activeLecture.contentUrl ? (
                <a
                  href={activeLecture.contentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-full w-full items-center justify-center text-primary-300 underline"
                >
                  {t('learn.openFile')}
                </a>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-400">
                  {t('learn.noContentYet')}
                </div>
              )}
            </div>

            <Button
              className="mt-4"
              disabled={activeLecture.completed || completeMutation.isPending}
              onClick={() => completeMutation.mutate(activeLecture.id)}
            >
              {activeLecture.completed ? t('learn.completed') : t('learn.markComplete')}
            </Button>
          </>
        ) : (
          <p className="text-neutral-500">{t('learn.noLectures')}</p>
        )}
      </main>
    </div>
  );
}
