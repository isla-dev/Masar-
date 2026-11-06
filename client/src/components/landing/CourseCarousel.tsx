import { ShowcaseCourse } from './placeholderCourses';
import { ShowcaseCourseCard } from './ShowcaseCourseCard';

export function CourseCarousel({ courses }: { courses: ShowcaseCourse[] }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {courses.map((course, i) => (
        <div key={i} className="snap-start">
          <ShowcaseCourseCard course={course} />
        </div>
      ))}
    </div>
  );
}
