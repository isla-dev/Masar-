import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../api/courses';
import { enrollmentsApi } from '../api/enrollments';
import { paymentsApi } from '../api/payments';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Feedback';
import { Badge } from '../components/common/Feedback';
import { Button } from '../components/common/Button';
import cibLogo from '../assets/payment/cib.png';
import edahabiaLogo from '../assets/payment/edahabia.png';

function formatDuration(seconds: number | null) {
  if (!seconds) return '';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.detail(id!),
    enabled: Boolean(id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentsApi.enroll(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      navigate(`/learn/${id}`);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (paymentMethod: 'cib' | 'edahabia') => paymentsApi.checkout(id!, paymentMethod),
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !course) {
    return <p className="py-24 text-center text-red-500">{t('common.errorLoading')}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-neutral-100">
            {course.thumbnailUrl && (
              <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
            )}
          </div>

          <h1 className="mt-6 text-2xl font-bold text-neutral-900">{course.title}</h1>
          <p className="mt-2 text-neutral-600">{course.teacher.name}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="neutral">{t(`courseLevel.${course.level}`)}</Badge>
            {course.category && <Badge tone="neutral">{course.category.slug}</Badge>}
            <Badge tone="neutral">
              {course.counts.lectures} {t('course.lectures')}
            </Badge>
            <Badge tone="neutral">
              {course.counts.quizzes} {t('course.quizzes')}
            </Badge>
            <Badge tone="neutral">
              {course.counts.assignments} {t('course.assignments')}
            </Badge>
          </div>

          {course.description && <p className="mt-6 whitespace-pre-line text-neutral-700">{course.description}</p>}

          <h2 className="mt-10 text-lg font-semibold text-neutral-900">{t('course.curriculum')}</h2>
          <div className="mt-4 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
            {course.curriculum.map((section) => (
              <div key={section.id} className="p-4">
                <h3 className="font-medium text-neutral-900">{section.title}</h3>
                <ul className="mt-2 space-y-1">
                  {section.lectures.map((lecture) => (
                    <li key={lecture.id} className="flex justify-between text-sm text-neutral-600">
                      <span>{lecture.title}</span>
                      <span>{formatDuration(lecture.durationSeconds)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-neutral-200 p-6">
          <div className="text-2xl font-bold text-primary-700">
            {course.isFree ? t('course.free') : `${course.price.toLocaleString()} ${t('course.currency')}`}
          </div>

          {!user && (
            <Link to="/login" state={{ from: `/courses/${id}` }}>
              <Button className="mt-4 w-full">{t('course.logInToEnroll')}</Button>
            </Link>
          )}

          {user?.role === 'student' && course.enrollmentStatus && (
            <Link to={`/learn/${id}`}>
              <Button className="mt-4 w-full">
                {course.enrollmentStatus === 'completed' ? t('course.viewCourse') : t('course.continueLearning')}
              </Button>
            </Link>
          )}

          {user?.role === 'student' && !course.enrollmentStatus && course.isFree && (
            <Button className="mt-4 w-full" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
              {t('course.enroll')}
            </Button>
          )}

          {user?.role === 'student' && !course.enrollmentStatus && !course.isFree && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs text-neutral-500">{t('course.payWith')}</p>
              <Button
                onClick={() => checkoutMutation.mutate('cib')}
                disabled={checkoutMutation.isPending}
                className="flex w-full items-center justify-center gap-2"
              >
                <img src={cibLogo} alt="" className="h-5 w-5 rounded-sm bg-white object-contain p-0.5" />
                {checkoutMutation.isPending ? t('common.loading') : t('course.payWithCib')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => checkoutMutation.mutate('edahabia')}
                disabled={checkoutMutation.isPending}
                className="flex w-full items-center justify-center gap-2"
              >
                <img src={edahabiaLogo} alt="" className="h-5 w-5 rounded-sm bg-white object-contain p-0.5" />
                {checkoutMutation.isPending ? t('common.loading') : t('course.payWithEdahabia')}
              </Button>
            </div>
          )}

          {user && user.role !== 'student' && (
            <p className="mt-4 text-sm text-neutral-500">{t('course.studentsOnly')}</p>
          )}

          {enrollMutation.isError && <p className="mt-2 text-sm text-red-500">{t('common.errorLoading')}</p>}
          {checkoutMutation.isError && <p className="mt-2 text-sm text-red-500">{t('course.checkoutError')}</p>}

          {course.rating !== null && (
            <p className="mt-3 text-sm text-neutral-500">
              ★ {course.rating.toFixed(1)} ({course.reviewCount} {t('course.reviews')})
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
