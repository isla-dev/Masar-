import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { CourseListParams } from '../../api/courses';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useLanguage } from '../../context/LanguageContext';

interface CourseFiltersProps {
  filters: CourseListParams;
  onChange: (filters: CourseListParams) => void;
}

export function CourseFilters({ filters, onChange }: CourseFiltersProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          placeholder={t('common.search')}
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
        />
      </div>
      <Select
        placeholder={t('nav.categories')}
        value={filters.category ?? ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value || undefined, page: 1 })}
        options={
          categories?.map((c) => ({
            value: c.id,
            label: c.name[language] ?? c.name.en ?? c.slug,
          })) ?? []
        }
      />
      <Select
        placeholder={t('course.level')}
        value={filters.level ?? ''}
        onChange={(e) =>
          onChange({ ...filters, level: (e.target.value || undefined) as CourseListParams['level'], page: 1 })
        }
        options={[
          { value: 'beginner', label: t('courseLevel.beginner') },
          { value: 'intermediate', label: t('courseLevel.intermediate') },
          { value: 'advanced', label: t('courseLevel.advanced') },
        ]}
      />
      <Select
        placeholder={t('course.priceFilter')}
        value={filters.isFree === undefined ? '' : String(filters.isFree)}
        onChange={(e) =>
          onChange({
            ...filters,
            isFree: e.target.value === '' ? undefined : e.target.value === 'true',
            page: 1,
          })
        }
        options={[
          { value: 'true', label: t('course.free') },
          { value: 'false', label: t('course.paid') },
        ]}
      />
    </div>
  );
}
