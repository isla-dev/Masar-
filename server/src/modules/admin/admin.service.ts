import { AppError } from '../../utils/AppError';
import { buildMeta } from '../../utils/pagination';
import { adminRepository } from './admin.repository';
import { ListCertificatesQuery, ListCoursesAdminQuery, ListUsersQuery } from './admin.validation';

function serializeCourseSummary(row: any) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    level: row.level,
    isFree: row.is_free,
    price: row.price !== undefined ? Number(row.price) : undefined,
    teacherName: row.teacher_name,
    teacherEmail: row.teacher_email,
    categorySlug: row.category_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const adminService = {
  async listPendingCourses() {
    const rows = await adminRepository.findPendingCourses();
    return rows.map(serializeCourseSummary);
  },

  async listAllCourses(params: ListCoursesAdminQuery) {
    const { rows, total } = await adminRepository.findAllCourses(params);
    return { data: rows.map(serializeCourseSummary), meta: buildMeta(params.page, params.limit, total) };
  },

  async approveCourse(courseId: string) {
    const row = await adminRepository.approveCourse(courseId);
    if (!row) throw new AppError('Course not found or not pending review', 409, 'INVALID_STATUS');
    return serializeCourseSummary(row);
  },

  async rejectCourse(courseId: string, reason: string) {
    const row = await adminRepository.rejectCourse(courseId, reason);
    if (!row) throw new AppError('Course not found or not pending review', 409, 'INVALID_STATUS');
    return serializeCourseSummary(row);
  },

  async listUsers(params: ListUsersQuery) {
    const { rows, total } = await adminRepository.findUsers(params);
    return {
      data: rows.map((r: any) => ({
        id: r.id,
        email: r.email,
        fullName: r.full_name,
        role: r.role,
        isActive: r.is_active,
        createdAt: r.created_at,
      })),
      meta: buildMeta(params.page, params.limit, total),
    };
  },

  async setUserActive(userId: string, isActive: boolean) {
    const row = await adminRepository.setUserActive(userId, isActive);
    if (!row) throw AppError.notFound('User not found');
    return { id: row.id, email: row.email, fullName: row.full_name, role: row.role, isActive: row.is_active };
  },

  async getPlatformStats() {
    return adminRepository.getPlatformStats();
  },

  async listCertificates(params: ListCertificatesQuery) {
    const { rows, total } = await adminRepository.findAllCertificates(params);
    return {
      data: rows.map((r: any) => ({
        id: r.id,
        certificateNumber: r.certificate_number,
        pdfUrl: r.pdf_url,
        issuedAt: r.issued_at,
        studentName: r.student_name,
        courseTitle: r.course_title,
      })),
      meta: buildMeta(params.page, params.limit, total),
    };
  },
};
