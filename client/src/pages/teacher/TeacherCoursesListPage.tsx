import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { teacherCoursesApi } from '../../api/teacherCourses';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Feedback';
import { Spinner } from '../../components/common/Feedback';

const STATUS_TONE: Record<string, 'primary' | 'neutral'> = {
  draft: 'neutral',
  pending: 'primary',
  published: 'primary',
  rejected: 'neutral',
};

export default function TeacherCoursesListPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-courses'],
    queryFn: () => teacherCoursesApi.listMine(),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{t('teacher.myCourses')}</h1>
        <Link to="/dashboard/teacher/courses/new">
          <Button>{t('teacher.newCourse')}</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {data && data.data.length === 0 && (
        <p className="py-16 text-center text-neutral-500">{t('teacher.noCoursesYet')}</p>
      )}

      <div className="flex flex-col gap-3">
        {data?.data.map((course) => (
          <Link
            key={course.id}
            to={`/dashboard/teacher/courses/${course.id}`}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm"
          >
            <div>
              <p className="font-medium text-neutral-900">{course.title}</p>
              <p className="text-sm text-neutral-500">
                {course.enrollmentCount ?? 0} {t('teacher.students')}
              </p>
            </div>
            <Badge tone={STATUS_TONE[course.status]}>{t(`courseStatus.${course.status}`)}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
