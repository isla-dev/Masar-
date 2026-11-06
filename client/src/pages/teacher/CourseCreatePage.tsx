import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherCoursesApi, CourseFormInput } from '../../api/teacherCourses';
import { categoriesApi } from '../../api/categories';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function CourseCreatePage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const { register, handleSubmit, watch } = useForm<CourseFormInput>({
    defaultValues: { level: 'beginner', isFree: true, price: 0, language: 'en' },
  });

  const isFree = watch('isFree');

  const createMutation = useMutation({
    mutationFn: (input: CourseFormInput) => teacherCoursesApi.create(input),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      navigate(`/dashboard/teacher/courses/${course.id}`);
    },
  });

  function onSubmit(values: CourseFormInput) {
    createMutation.mutate({ ...values, price: isFree ? 0 : Number(values.price) });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('teacher.newCourse')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label={t('course.title')} {...register('title', { required: true })} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">{t('course.description')}</label>
          <textarea
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            rows={4}
            {...register('description')}
          />
        </div>

        <Select
          label={t('nav.categories')}
          placeholder={t('course.selectCategory')}
          options={
            categories?.map((c) => ({ value: c.id, label: c.name[language] ?? c.name.en ?? c.slug })) ?? []
          }
          {...register('categoryId')}
        />

        <Select
          options={[
            { value: 'beginner', label: t('courseLevel.beginner') },
            { value: 'intermediate', label: t('courseLevel.intermediate') },
            { value: 'advanced', label: t('courseLevel.advanced') },
          ]}
          {...register('level')}
        />

        <Select
          options={[
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'Français' },
            { value: 'ar', label: 'العربية' },
          ]}
          {...register('language')}
        />

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" {...register('isFree')} />
          {t('course.free')}
        </label>

        {!isFree && (
          <Input type="number" min={0} step="0.01" label={t('course.priceFilter')} {...register('price')} />
        )}

        <Button type="submit" disabled={createMutation.isPending}>
          {t('common.save')}
        </Button>

        {createMutation.isError && <p className="text-sm text-red-500">{t('common.errorLoading')}</p>}
      </form>
    </div>
  );
}
