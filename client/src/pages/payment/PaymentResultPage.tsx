import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { coursesApi } from '../../api/courses';
import { Spinner } from '../../components/common/Feedback';
import { Button } from '../../components/common/Button';

const MAX_POLLS = 10; // ~20s at 2s intervals — generous for a webhook round trip

export default function PaymentResultPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const redirectStatus = searchParams.get('status'); // what Chargily's redirect claims — informational only
  const [pollCount, setPollCount] = useState(0);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.detail(courseId!),
    enabled: Boolean(courseId) && redirectStatus === 'success',
    refetchInterval: (query) => {
      const enrolled = Boolean(query.state.data?.enrollmentStatus);
      if (enrolled || pollCount >= MAX_POLLS) return false;
      return 2000;
    },
  });

  useEffect(() => {
    if (redirectStatus === 'success' && !course?.enrollmentStatus) {
      const timer = setTimeout(() => setPollCount((c) => c + 1), 2000);
      return () => clearTimeout(timer);
    }
  }, [course, redirectStatus]);

  const isConfirmed = Boolean(course?.enrollmentStatus);
  const isTimedOut = pollCount >= MAX_POLLS && !isConfirmed;

  if (redirectStatus === 'failure') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold text-red-600">{t('payment.failed')}</p>
        <p className="mt-2 text-sm text-neutral-500">{t('payment.failedDescription')}</p>
        {courseId && (
          <Link to={`/courses/${courseId}`} className="mt-4">
            <Button variant="secondary">{t('payment.backToCourse')}</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      {isConfirmed ? (
        <>
          <p className="text-lg font-semibold text-primary-700">{t('payment.confirmed')}</p>
          <p className="mt-2 text-sm text-neutral-500">{t('payment.confirmedDescription')}</p>
          {courseId && (
            <Link to={`/learn/${courseId}`} className="mt-4">
              <Button>{t('course.continueLearning')}</Button>
            </Link>
          )}
        </>
      ) : isTimedOut ? (
        <>
          <p className="text-lg font-semibold text-neutral-900">{t('payment.stillProcessing')}</p>
          <p className="mt-2 text-sm text-neutral-500">{t('payment.stillProcessingDescription')}</p>
          <Link to="/dashboard/student" className="mt-4">
            <Button variant="secondary">{t('nav.dashboard')}</Button>
          </Link>
        </>
      ) : (
        <>
          <Spinner />
          <p className="mt-4 text-sm text-neutral-500">{isLoading ? t('common.loading') : t('payment.confirming')}</p>
        </>
      )}
    </div>
  );
}
