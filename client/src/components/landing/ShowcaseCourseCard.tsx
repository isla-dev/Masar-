import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShowcaseCourse } from './placeholderCourses';

export function ShowcaseCourseCard({ course }: { course: ShowcaseCourse }) {
  const { t } = useTranslation();
  const discountPct = course.originalPrice
    ? Math.round(((course.originalPrice - (course.price ?? 0)) / course.originalPrice) * 100)
    : null;

  return (
    <Link
      to="/courses"
      className="group flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg sm:w-full"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {course.badge && (
          <span className="absolute start-2 top-2 rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold text-white">
            {course.badge === 'bestseller' ? t('landing.bestseller') : t('landing.trending')}
          </span>
        )}
        {course.price === null && (
          <span className="absolute end-2 top-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">
            {t('course.free')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-medium text-primary-600">{course.category}</p>
        <h3 className="line-clamp-2 font-display text-base font-semibold text-neutral-900">{course.title}</h3>
        <p className="text-xs text-neutral-500">{course.instructor}</p>

        <div className="flex items-center gap-1 text-xs text-neutral-600">
          <span className="font-semibold text-gold-600">{course.rating.toFixed(1)}</span>
          <span className="text-gold-500">★★★★★</span>
          <span className="text-neutral-400">({course.reviews})</span>
        </div>

        <p className="text-xs text-neutral-500">
          {course.students.toLocaleString()} {t('landing.students')} · {course.durationHours}
          {t('landing.hoursShort')} · {t(`courseLevel.${course.level}`)}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          {course.price === null ? (
            <span className="font-semibold text-primary-700">{t('course.free')}</span>
          ) : (
            <>
              <span className="font-semibold text-neutral-900">
                {course.price.toLocaleString()} {t('course.currency')}
              </span>
              {course.originalPrice && (
                <>
                  <span className="text-xs text-neutral-400 line-through">
                    {course.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-primary-600">-{discountPct}%</span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
