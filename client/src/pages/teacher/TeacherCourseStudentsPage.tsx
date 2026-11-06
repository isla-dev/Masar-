import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { teacherDashboardApi } from '../../api/teacherDashboard';
import { Spinner, Badge } from '../../components/common/Feedback';

export default function TeacherCourseStudentsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: students, isLoading } = useQuery({
    queryKey: ['course-students', id],
    queryFn: () => teacherDashboardApi.getEnrolledStudents(id!),
    enabled: Boolean(id),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('teacher.enrolledStudents')}</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {students && students.length === 0 && (
        <p className="py-16 text-center text-neutral-500">{t('teacher.noStudentsYet')}</p>
      )}

      <div className="flex flex-col gap-3">
        {students?.map((s) => (
          <div key={s.enrollmentId} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">{s.student.name}</p>
                <p className="text-xs text-neutral-500">{s.student.email}</p>
              </div>
              <Badge tone={s.status === 'completed' ? 'primary' : 'neutral'}>
                {s.status === 'completed' ? t('student.completed') : t('teacher.inProgress')}
              </Badge>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${s.progress.percent}%` }} />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {s.progress.completedLectures}/{s.progress.totalLectures} · {s.progress.percent}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
