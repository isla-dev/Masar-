import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CourseListItem } from '../../api/courses';
import { Badge } from '../common/Feedback';

export function CourseCard({ course }: { course: CourseListItem }) {
  const { t } = useTranslation();

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-video w-full bg-neutral-100">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            {course.title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-semibold text-neutral-900 group-hover:text-primary-700">
          {course.title}
        </h3>
        <p className="text-sm text-neutral-500">{course.teacher.name}</p>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">{t(`courseLevel.${course.level}`)}</Badge>
          {course.category && <Badge tone="neutral">{course.category.slug}</Badge>}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-primary-700">
            {course.isFree ? t('course.free') : `${course.price.toFixed(2)}`}
          </span>
          {course.rating !== null && (
            <span className="text-sm text-neutral-500">
              ★ {course.rating.toFixed(1)} ({course.reviewCount})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
