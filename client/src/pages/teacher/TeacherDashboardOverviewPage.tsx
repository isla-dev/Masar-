import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { teacherDashboardApi } from '../../api/teacherDashboard';
import { Spinner, Badge } from '../../components/common/Feedback';

type StatTone = 'primary' | 'neutral' | 'amber';

const TONE_CLASSES: Record<StatTone, string> = {
  primary: 'bg-primary-50 text-primary-700',
  neutral: 'bg-neutral-100 text-neutral-600',
  amber: 'bg-amber-50 text-amber-700',
};

function StatCard({
  label,
  value,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-lg ${TONE_CLASSES[tone]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400">
      {label}
    </div>
  );
}

export default function TeacherDashboardOverviewPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-overview'],
    queryFn: teacherDashboardApi.getOverview,
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('teacher.overview')}</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t('teacher.totalCourses')} value={data.courses.total} icon="📚" tone="neutral" />
        <StatCard label={t('courseStatus.published')} value={data.courses.published} icon="✅" tone="primary" />
        <StatCard label={t('courseStatus.draft')} value={data.courses.draft} icon="📝" tone="neutral" />
        <StatCard label={t('courseStatus.pending')} value={data.courses.pending} icon="⏳" tone="amber" />
        <StatCard label={t('teacher.totalStudents')} value={data.totalStudents} icon="👥" tone="primary" />
        <StatCard label={t('teacher.completionRate')} value={`${data.completionRate}%`} icon="🎯" tone="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold text-neutral-900">{t('teacher.recentEnrollments')}</h2>
          {data.recentEnrollments.length === 0 && <EmptyCard label={t('teacher.noneYet')} />}
          <div className="flex flex-col gap-2">
            {data.recentEnrollments.map((e, i) => (
              <Link
                key={i}
                to={`/dashboard/teacher/courses/${e.courseId}/students`}
                className="rounded-lg border border-neutral-200 bg-white p-3 text-sm hover:shadow-sm"
              >
                <span className="font-medium text-neutral-900">{e.studentName}</span>{' '}
                <span className="text-neutral-500">→ {e.courseTitle}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold text-neutral-900">{t('teacher.recentSubmissions')}</h2>
          {data.recentSubmissions.length === 0 && <EmptyCard label={t('teacher.noneYet')} />}
          <div className="flex flex-col gap-2">
            {data.recentSubmissions.map((s) => (
              <Link
                key={s.id}
                to={`/dashboard/teacher/assignments/${s.assignmentId}/submissions`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm hover:shadow-sm"
              >
                <span>
                  <span className="font-medium text-neutral-900">{s.studentName}</span>{' '}
                  <span className="text-neutral-500">→ {s.assignmentTitle}</span>
                </span>
                {s.grade !== null ? (
                  <Badge tone="primary">{s.grade}</Badge>
                ) : (
                  <Badge>{t('assignment.awaitingGrade')}</Badge>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
