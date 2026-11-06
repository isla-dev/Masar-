import { AppError } from '../../utils/AppError';
import { buildMeta } from '../../utils/pagination';
import { coursesRepository } from './courses.repository';
import { CreateCourseInput, ListCoursesQuery, ListMineQuery, UpdateCourseInput } from './courses.validation';

function serializeOwnedCourse(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    level: row.level,
    price: Number(row.price),
    isFree: row.is_free,
    status: row.status,
    language: row.language,
    rejectionReason: row.rejection_reason,
    category: row.category_id ? { id: row.category_id, slug: row.category_slug } : null,
    enrollmentCount: row.enrollment_count !== undefined ? Number(row.enrollment_count) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Loads a course and throws 404/403-shaped errors if it isn't owned by teacherId. */
async function requireOwnedCourse(courseId: string, teacherId: string) {
  const course = await coursesRepository.findRawById(courseId);
  if (!course) throw AppError.notFound('Course not found');
  if (course.teacher_id !== teacherId) throw AppError.forbidden('You do not own this course');
  return course;
}

export const coursesService = {
  async list(params: ListCoursesQuery) {
    const { rows, total } = await coursesRepository.findPublished(params);

    const data = rows.map((r) => ({
      id: r.id,
      title: r.title,
      thumbnailUrl: r.thumbnail_url,
      level: r.level,
      price: Number(r.price),
      isFree: r.is_free,
      language: r.language,
      category: r.category_id ? { id: r.category_id, slug: r.category_slug } : null,
      teacher: { id: r.teacher_id, name: r.teacher_name },
      lectureCount: Number(r.lecture_count),
      rating: r.avg_rating ? Number(r.avg_rating) : null,
      reviewCount: Number(r.review_count),
    }));

    return { data, meta: buildMeta(params.page, params.limit, total) };
  },

  async detail(id: string, studentId?: string) {
    const result = await coursesRepository.findPublishedById(id);
    if (!result) {
      throw AppError.notFound('Course not found');
    }

    const { course, curriculumRows, counts } = result as any;

    const enrollmentStatus = studentId
      ? await coursesRepository.findEnrollmentStatus(id, studentId)
      : undefined;

    const sectionsMap = new Map<string, any>();
    for (const row of curriculumRows) {
      if (!sectionsMap.has(row.section_id)) {
        sectionsMap.set(row.section_id, {
          id: row.section_id,
          title: row.section_title,
          order: row.section_order,
          lectures: [] as unknown[],
        });
      }
      if (row.lecture_id) {
        sectionsMap.get(row.section_id).lectures.push({
          id: row.lecture_id,
          title: row.lecture_title,
          contentType: row.content_type,
          durationSeconds: row.duration_seconds,
          order: row.lecture_order,
        });
      }
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      level: course.level,
      price: Number(course.price),
      isFree: course.is_free,
      language: course.language,
      category: course.category_id ? { id: course.category_id, slug: course.category_slug } : null,
      teacher: { id: course.teacher_id, name: course.teacher_name, avatarUrl: course.teacher_avatar },
      rating: course.avg_rating ? Number(course.avg_rating) : null,
      reviewCount: Number(course.review_count),
      createdAt: course.created_at,
      enrollmentStatus: enrollmentStatus ?? null,
      curriculum: Array.from(sectionsMap.values()),
      counts: {
        sections: Number(counts.section_count),
        lectures: Number(counts.lecture_count),
        quizzes: Number(counts.quiz_count),
        assignments: Number(counts.assignment_count),
      },
    };
  },

  async create(teacherId: string, input: CreateCourseInput) {
    const row = await coursesRepository.create({
      teacherId,
      categoryId: input.categoryId ?? null,
      title: input.title,
      description: input.description ?? null,
      level: input.level,
      price: input.price,
      isFree: input.isFree,
      language: input.language,
    });
    return serializeOwnedCourse(row);
  },

  async update(courseId: string, teacherId: string, input: UpdateCourseInput) {
    await requireOwnedCourse(courseId, teacherId);
    const row = await coursesRepository.updateOwned(courseId, teacherId, {
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      level: input.level,
      price: input.price,
      isFree: input.isFree,
      language: input.language,
    });
    if (!row) throw AppError.notFound('Course not found');
    return serializeOwnedCourse(row);
  },

  async remove(courseId: string, teacherId: string) {
    await requireOwnedCourse(courseId, teacherId);
    const deleted = await coursesRepository.deleteOwned(courseId, teacherId);
    if (!deleted) throw AppError.notFound('Course not found');
  },

  async setThumbnail(courseId: string, teacherId: string, url: string) {
    await requireOwnedCourse(courseId, teacherId);
    const row = await coursesRepository.setThumbnailOwned(courseId, teacherId, url);
    if (!row) throw AppError.notFound('Course not found');
    return serializeOwnedCourse(row);
  },

  async submitForReview(courseId: string, teacherId: string) {
    const course = await requireOwnedCourse(courseId, teacherId);
    if (!['draft', 'rejected'].includes(course.status)) {
      throw new AppError('Only draft or rejected courses can be submitted for review', 409, 'INVALID_STATUS');
    }
    const row = await coursesRepository.submitForReviewOwned(courseId, teacherId);
    if (!row) throw AppError.notFound('Course not found');
    return serializeOwnedCourse(row);
  },

  async getOwned(courseId: string, teacherId: string) {
    const course = await requireOwnedCourse(courseId, teacherId);
    return serializeOwnedCourse(course);
  },

  async listMine(teacherId: string, params: ListMineQuery) {
    const { rows, total } = await coursesRepository.findMine(teacherId, params);
    return {
      data: rows.map(serializeOwnedCourse),
      meta: buildMeta(params.page, params.limit, total),
    };
  },
};
