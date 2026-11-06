import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Spinner, Badge } from '../../components/common/Feedback';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';

const STATUS_TONE: Record<string, 'primary' | 'neutral'> = {
  draft: 'neutral',
  pending: 'primary',
  published: 'primary',
  rejected: 'neutral',
};

export default function AdminCoursesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-courses', search, status, page],
    queryFn: () => adminApi.listAllCourses({ search: search || undefined, status: status || undefined, page, limit: 20 }),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('admin.allCourses')}</h1>

      <div className="mb-4 flex gap-3">
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1"
        />
        <Select
          placeholder={t('admin.allStatuses')}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'draft', label: t('courseStatus.draft') },
            { value: 'pending', label: t('courseStatus.pending') },
            { value: 'published', label: t('courseStatus.published') },
            { value: 'rejected', label: t('courseStatus.rejected') },
          ]}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {data?.data.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm"
          >
            <div>
              <p className="font-medium text-neutral-900">{course.title}</p>
              <p className="text-xs text-neutral-500">{course.teacherName}</p>
            </div>
            <Badge tone={STATUS_TONE[course.status]}>{t(`courseStatus.${course.status}`)}</Badge>
          </div>
        ))}
      </div>

      {data && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
