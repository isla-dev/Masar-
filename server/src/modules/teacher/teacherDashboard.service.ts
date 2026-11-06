import { AppError } from '../../utils/AppError';
import { teacherDashboardRepository } from './teacherDashboard.repository';

export const teacherDashboardService = {
  async getOverview(teacherId: string) {
    const [counts, studentStats, recentEnrollments, recentSubmissions] = await Promise.all([
      teacherDashboardRepository.getCourseCounts(teacherId),
      teacherDashboardRepository.getStudentStats(teacherId),
      teacherDashboardRepository.getRecentEnrollments(teacherId),
      teacherDashboardRepository.getRecentSubmissions(teacherId),
    ]);

    return {
      courses: {
        total: Number(counts.total),
        published: Number(counts.published),
        draft: Number(counts.draft),
        pending: Number(counts.pending),
        rejected: Number(counts.rejected),
      },
      totalStudents: Number(studentStats.total_students),
      completionRate: studentStats.completion_rate ? Math.round(Number(studentStats.completion_rate) * 100) : 0,
      recentEnrollments: recentEnrollments.map((r: any) => ({
        studentName: r.student_name,
        courseTitle: r.course_title,
        courseId: r.course_id,
        enrolledAt: r.enrolled_at,
      })),
      recentSubmissions: recentSubmissions.map((r: any) => ({
        id: r.id,
        studentName: r.student_name,
        assignmentTitle: r.assignment_title,
        assignmentId: r.assignment_id,
        courseTitle: r.course_title,
        submittedAt: r.submitted_at,
        grade: r.grade,
      })),
    };
  },

  async getEnrolledStudents(courseId: string, teacherId: string) {
    const rows = await teacherDashboardRepository.getEnrolledStudents(courseId, teacherId);
    if (rows === null) throw AppError.notFound('Course not found');

    return rows.map((r: any) => {
      const total = Number(r.total_lectures);
      const completed = Number(r.completed_lectures);
      return {
        enrollmentId: r.enrollment_id,
        status: r.status,
        enrolledAt: r.enrolled_at,
        completedAt: r.completed_at,
        student: { id: r.student_id, name: r.student_name, email: r.student_email },
        progress: { totalLectures: total, completedLectures: completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 },
      };
    });
  },
};
