import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { coursesApi, CourseListParams } from '../api/courses';
import { CourseCard } from '../components/course/CourseCard';
import { CourseFilters } from '../components/course/CourseFilters';
import { Pagination } from '../components/common/Pagination';
import { Spinner } from '../components/common/Feedback';

export default function CoursesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<CourseListParams>({
    page: 1,
    limit: 12,
    search: searchParams.get('search') ?? undefined,
    isFree: searchParams.has('isFree') ? searchParams.get('isFree') === 'true' : undefined,
    category: searchParams.get('category') ?? undefined,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesApi.list(filters),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('nav.courses')}</h1>

      <CourseFilters filters={filters} onChange={setFilters} />

      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {isError && (
          <p className="py-16 text-center text-red-500">{t('common.errorLoading')}</p>
        )}

        {data && data.data.length === 0 && (
          <p className="py-16 text-center text-neutral-500">{t('course.noResults')}</p>
        )}

        {data && data.data.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {data && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        )}
      </div>
    </div>
  );
}
