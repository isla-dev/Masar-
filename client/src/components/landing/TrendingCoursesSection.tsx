import { useTranslation } from 'react-i18next';
import { CourseCarousel } from './CourseCarousel';
import { TRENDING_COURSES } from './placeholderCourses';

export function TrendingCoursesSection() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="font-display text-3xl font-semibold text-neutral-900">{t('landing.trendingTitle')}</h2>
      <div className="mt-8">
        <CourseCarousel courses={TRENDING_COURSES} />
      </div>
    </section>
  );
}
