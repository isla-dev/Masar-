import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { enrollmentsApi } from '../../api/enrollments';
import { certificatesApi } from '../../api/certificates';
import { quizzesApi } from '../../api/quizzes';
import { assignmentsApi } from '../../api/assignments';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Badge } from '../../components/common/Feedback';
import { Button } from '../../components/common/Button';

function timeAgo(dateStr: string, locale: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diffMin, 'minute');
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diffHr, 'hour');
  const diffDay = Math.round(diffHr / 24);
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diffDay, 'day');
}

export default function StudentDashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['my-enrollments'], queryFn: enrollmentsApi.listMine });
  const { data: certificates } = useQuery({ queryKey: ['my-certificates'], queryFn: certificatesApi.listMine });
  const { data: quizResults } = useQuery({ queryKey: ['my-quiz-results'], queryFn: quizzesApi.getResultsForStudent });
  const { data: assignmentResults } = useQuery({
    queryKey: ['my-assignment-results'],
    queryFn: assignmentsApi.getResultsForStudent,
  });
  const { data: activity } = useQuery({ queryKey: ['my-activity'], queryFn: enrollmentsApi.getRecentActivity });

  const inProgress = data?.filter((e) => e.status === 'active') ?? [];
  const completed = data?.filter((e) => e.status === 'completed') ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <p className="text-sm text-neutral-500">
        {t('student.welcome', { name: user?.full_name?.split(' ')[0] ?? '' })}
      </p>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('student.myLearning')}</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="mb-4 text-neutral-500">{t('student.noEnrollments')}</p>
          <Link to="/courses">
            <Button>{t('nav.courses')}</Button>
          </Link>
        </div>
      )}

      {inProgress.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-semibold text-neutral-900">{t('student.continueLearning')}</h2>
          <div className="flex flex-col gap-3">
            {inProgress.map((e) => (
              <Link
                key={e.enrollmentId}
                to={`/learn/${e.course.id}`}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {e.course.thumbnailUrl && (
                    <img src={e.course.thumbnailUrl} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{e.course.title}</p>
                  <p className="text-sm text-neutral-500">{e.course.teacherName}</p>
                  <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${e.progress.percent}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-neutral-500">{e.progress.percent}%</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-neutral-900">{t('student.completedCourses')}</h2>
          <div className="flex flex-col gap-3">
            {completed.map((e) => (
              <Link
                key={e.enrollmentId}
                to={`/learn/${e.course.id}`}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm"
              >
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {e.course.thumbnailUrl && (
                    <img src={e.course.thumbnailUrl} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{e.course.title}</p>
                  <p className="text-sm text-neutral-500">{e.course.teacherName}</p>
                </div>
                <span className="text-sm font-medium text-primary-600">{t('student.completed')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {certificates && certificates.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold text-neutral-900">{t('student.certificates')}</h2>
          <div className="flex flex-col gap-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">{cert.courseTitle}</p>
                  <p className="text-xs text-neutral-500">
                    {cert.certificateNumber} · {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <a href={cert.pdfUrl} target="_blank" rel="noreferrer">
                  <Button variant="secondary">{t('student.download')}</Button>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
      {quizResults && quizResults.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold text-neutral-900">{t('student.quizResults')}</h2>
          <div className="flex flex-col gap-2">
            {quizResults.map((r) => (
              <div
                key={r.quizId}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">{r.quizTitle}</p>
                  <p className="text-xs text-neutral-500">{r.courseTitle}</p>
                </div>
                <Badge tone={r.passed ? 'primary' : 'neutral'}>{r.bestScore}%</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {assignmentResults && assignmentResults.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold text-neutral-900">{t('student.assignmentResults')}</h2>
          <div className="flex flex-col gap-2">
            {assignmentResults.map((r) => (
              <div
                key={r.submissionId}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">{r.assignmentTitle}</p>
                  <p className="text-xs text-neutral-500">{r.courseTitle}</p>
                </div>
                {r.graded ? (
                  <Badge tone="primary">
                    {r.grade}/{r.maxScore}
                  </Badge>
                ) : (
                  <Badge>{t('assignment.awaitingGrade')}</Badge>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {activity && activity.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold text-neutral-900">{t('student.recentActivity')}</h2>
          <div className="flex flex-col gap-1">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                <span className="text-neutral-700">
                  {a.type === 'lecture' && `📖 ${t('student.activityLecture', { title: a.label })}`}
                  {a.type === 'quiz' && `📝 ${t('student.activityQuiz', { title: a.label, score: a.score })}`}
                  {a.type === 'assignment' && `📎 ${t('student.activityAssignment', { title: a.label })}`}
                  <span className="text-neutral-400"> · {a.courseTitle}</span>
                </span>
                <span className="shrink-0 text-xs text-neutral-400">{timeAgo(a.at, i18n.language)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
