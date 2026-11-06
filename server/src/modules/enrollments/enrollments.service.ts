import { AppError } from '../../utils/AppError';
import { enrollmentsRepository } from './enrollments.repository';
import { certificatesService } from '../certificates/certificates.service';

function serializeMine(row: any) {
  const total = Number(row.total_lectures);
  const completed = Number(row.completed_lectures);
  return {
    enrollmentId: row.enrollment_id,
    status: row.enrollment_status,
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at,
    course: {
      id: row.course_id,
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
      level: row.level,
      teacherName: row.teacher_name,
    },
    progress: {
      totalLectures: total,
      completedLectures: completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
  };
}

export const enrollmentsService = {
  async enroll(studentId: string, courseId: string) {
    const course = await enrollmentsRepository.findPublishedCourse(courseId);
    if (!course) throw AppError.notFound('Course not found');

    const existing = await enrollmentsRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) throw AppError.conflict('Already enrolled in this course');

    if (!course.is_free) {
      // Paid checkout is implemented in the payments module (later phase).
      // Free courses can be enrolled in directly here.
      throw new AppError(
        'This course requires payment. Checkout is not available yet.',
        402,
        'PAYMENT_REQUIRED'
      );
    }

    const enrollment = await enrollmentsRepository.create(studentId, courseId);
    return {
      id: enrollment.id,
      courseId: enrollment.course_id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolled_at,
    };
  },

  async listMine(studentId: string) {
    const rows = await enrollmentsRepository.findMineWithProgress(studentId);
    return rows.map(serializeMine);
  },

  async getLearningContent(courseId: string, studentId: string) {
    const enrollment = await enrollmentsRepository.findByStudentAndCourse(studentId, courseId);
    if (!enrollment) throw AppError.forbidden('You are not enrolled in this course');

    const course = await enrollmentsRepository.findPublishedCourse(courseId);
    if (!course) throw AppError.notFound('Course not found');

    const curriculumRows = await enrollmentsRepository.getCurriculumForLearning(courseId);
    const completedIds = new Set(await enrollmentsRepository.getCompletedLectureIds(enrollment.id));
    const quizRows = await enrollmentsRepository.getQuizzesForCourse(courseId, studentId);
    const assignmentRows = await enrollmentsRepository.getAssignmentsForCourse(courseId, studentId);

    const sectionsMap = new Map<string, any>();
    for (const row of curriculumRows) {
      if (!sectionsMap.has(row.section_id)) {
        sectionsMap.set(row.section_id, {
          id: row.section_id,
          title: row.section_title,
          order: row.section_order,
          lectures: [] as unknown[],
          quizzes: [] as unknown[],
          assignments: [] as unknown[],
        });
      }
      if (row.lecture_id) {
        sectionsMap.get(row.section_id).lectures.push({
          id: row.lecture_id,
          title: row.lecture_title,
          contentType: row.content_type,
          contentUrl: row.content_url,
          durationSeconds: row.duration_seconds,
          order: row.lecture_order,
          completed: completedIds.has(row.lecture_id),
        });
      }
    }

    // Ensure sections that only contain quizzes/assignments (no lectures) still appear.
    function ensureSection(sectionId: string) {
      if (!sectionsMap.has(sectionId)) {
        sectionsMap.set(sectionId, {
          id: sectionId,
          title: '',
          order: 0,
          lectures: [] as unknown[],
          quizzes: [] as unknown[],
          assignments: [] as unknown[],
        });
      }
      return sectionsMap.get(sectionId);
    }

    for (const row of quizRows as any[]) {
      ensureSection(row.section_id).quizzes.push({
        id: row.id,
        title: row.title,
        passingScore: row.passing_score,
        order: row.order_index,
        bestScore: row.best_score !== null ? Number(row.best_score) : null,
        passed: row.best_passed ?? false,
        attemptCount: Number(row.attempt_count ?? 0),
      });
    }

    for (const row of assignmentRows as any[]) {
      ensureSection(row.section_id).assignments.push({
        id: row.id,
        title: row.title,
        dueDate: row.due_date,
        maxScore: row.max_score,
        order: row.order_index,
        submitted: row.submitted_at !== null,
        grade: row.grade,
        graded: row.graded_at !== null,
      });
    }

    const total = curriculumRows.filter((r: any) => r.lecture_id).length;
    const completed = completedIds.size;

    return {
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      course: { id: course.id, title: course.title, description: course.description },
      curriculum: Array.from(sectionsMap.values()),
      progress: {
        totalLectures: total,
        completedLectures: completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    };
  },

  async getRecentActivity(studentId: string) {
    const rows = await enrollmentsRepository.getRecentActivity(studentId);
    return rows.map((r: any) => ({
      type: r.type,
      label: r.label,
      courseTitle: r.course_title,
      at: r.at,
      score: r.score ?? undefined,
      passed: r.passed ?? undefined,
    }));
  },

  async completeLecture(lectureId: string, studentId: string) {
    const enrollment = await enrollmentsRepository.findEnrollmentForLecture(lectureId, studentId);
    if (!enrollment) throw AppError.forbidden('You are not enrolled in the course this lecture belongs to');

    await enrollmentsRepository.markLectureComplete(enrollment.id, lectureId);

    const { total, completed } = await enrollmentsRepository.countProgress(enrollment.id, enrollment.course_id);
    let courseCompleted = false;
    if (total > 0 && completed >= total) {
      await enrollmentsRepository.markEnrollmentCompleted(enrollment.id);
      courseCompleted = true;

      // Certificate generation shouldn't block/fail the lecture-completion
      // response if PDF rendering has a hiccup — log and continue either way.
      try {
        const course = await enrollmentsRepository.findPublishedCourse(enrollment.course_id);
        await certificatesService.generateForCompletion(studentId, enrollment.course_id, course?.language ?? 'en');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Certificate generation failed for enrollment', enrollment.id, err);
      }
    }

    return {
      totalLectures: total,
      completedLectures: completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      courseCompleted,
    };
  },
};
