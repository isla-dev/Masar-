import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminCourseSummary } from '../../api/admin';
import { Spinner } from '../../components/common/Feedback';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

function PendingCourseRow({ course }: { course: AdminCourseSummary }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] });

  const approveMutation = useMutation({ mutationFn: () => adminApi.approveCourse(course.id), onSuccess: invalidate });
  const rejectMutation = useMutation({
    mutationFn: () => adminApi.rejectCourse(course.id, reason),
    onSuccess: invalidate,
  });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900">{course.title}</p>
          <p className="text-xs text-neutral-500">
            {course.teacherName} · {course.teacherEmail}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
            {t('admin.approve')}
          </Button>
          <Button variant="secondary" onClick={() => setIsRejecting((v) => !v)}>
            {t('admin.reject')}
          </Button>
        </div>
      </div>

      {isRejecting && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder={t('admin.rejectionReason')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="secondary"
            disabled={!reason.trim() || rejectMutation.isPending}
            onClick={() => rejectMutation.mutate()}
          >
            {t('admin.confirmReject')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminPendingCoursesPage() {
  const { t } = useTranslation();
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-pending-courses'],
    queryFn: adminApi.listPendingCourses,
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('admin.pendingCourses')}</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {courses && courses.length === 0 && (
        <p className="py-16 text-center text-neutral-500">{t('admin.noPendingCourses')}</p>
      )}

      <div className="flex flex-col gap-3">
        {courses?.map((course) => (
          <PendingCourseRow key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
