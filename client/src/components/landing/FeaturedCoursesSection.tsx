import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CourseCarousel } from './CourseCarousel';
import { FEATURED_COURSES } from './placeholderCourses';
import { Button } from '../common/Button';

export function FeaturedCoursesSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-neutral-900">{t('landing.featuredTitle')}</h2>
            <p className="mt-2 max-w-xl text-neutral-600">{t('landing.featuredSubtitle')}</p>
          </div>
          <Link to="/courses">
            <Button variant="secondary">{t('landing.viewAllCourses')}</Button>
          </Link>
        </div>

        <div className="mt-8">
          <CourseCarousel courses={FEATURED_COURSES} />
        </div>
      </div>
    </section>
  );
}
