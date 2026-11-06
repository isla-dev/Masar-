import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FREE_COURSES } from './placeholderCourses';
import { ShowcaseCourseCard } from './ShowcaseCourseCard';
import { Button } from '../common/Button';

export function FreeCoursesSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-primary-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-neutral-900">{t('landing.freeTitle')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-neutral-600">{t('landing.freeSubtitle')}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FREE_COURSES.map((course, i) => (
            <ShowcaseCourseCard key={i} course={course} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/courses?isFree=true">
            <Button>{t('landing.startLearning')}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
