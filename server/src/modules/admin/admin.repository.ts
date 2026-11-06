import { query } from '../../config/db';
import { toOffset } from '../../utils/pagination';

export const adminRepository = {
  // --- Course approval ---

  async findPendingCourses() {
    const result = await query(
      `SELECT c.id, c.title, c.level, c.price, c.is_free, c.language, c.updated_at,
              u.full_name AS teacher_name, u.email AS teacher_email,
              cat.slug AS category_slug
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       WHERE c.status = 'pending'
       ORDER BY c.updated_at ASC`
    );
    return result.rows;
  },

  async findAllCourses(params: { status?: string; search?: string; page: number; limit: number }) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.status) {
      values.push(params.status);
      conditions.push(`c.status = $${values.length}`);
    }
    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`(c.title ILIKE $${values.length} OR u.full_name ILIKE $${values.length})`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(params.limit, toOffset(params));

    const result = await query(
      `SELECT c.id, c.title, c.status, c.level, c.is_free, c.price, c.created_at,
              u.full_name AS teacher_name, cat.slug AS category_slug,
              COUNT(*) OVER() AS total_count
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    const total = Number(result.rows[0]?.total_count ?? 0);
    return { rows: result.rows, total };
  },

  async approveCourse(courseId: string) {
    const result = await query(
      `UPDATE courses SET status = 'published', rejection_reason = NULL, updated_at = now()
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [courseId]
    );
    return result.rows[0] ?? null;
  },

  async rejectCourse(courseId: string, reason: string) {
    const result = await query(
      `UPDATE courses SET status = 'rejected', rejection_reason = $2, updated_at = now()
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [courseId, reason]
    );
    return result.rows[0] ?? null;
  },

  // --- Users ---

  async findUsers(params: { role?: string; search?: string; page: number; limit: number }) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.role) {
      values.push(params.role);
      conditions.push(`role = $${values.length}`);
    }
    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`(full_name ILIKE $${values.length} OR email ILIKE $${values.length})`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(params.limit, toOffset(params));

    const result = await query(
      `SELECT id, email, full_name, role, is_active, created_at, COUNT(*) OVER() AS total_count
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    const total = Number(result.rows[0]?.total_count ?? 0);
    return { rows: result.rows, total };
  },

  async setUserActive(userId: string, isActive: boolean) {
    const result = await query(
      `UPDATE users SET is_active = $2, updated_at = now() WHERE id = $1 RETURNING id, email, full_name, role, is_active`,
      [userId, isActive]
    );
    return result.rows[0] ?? null;
  },

  // --- Platform stats ---

  async getPlatformStats() {
    const [users, courses, enrollments, certificates, categories] = await Promise.all([
      query<{ total_students: string; total_teachers: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE role = 'student') AS total_students,
           COUNT(*) FILTER (WHERE role = 'teacher') AS total_teachers
         FROM users`
      ),
      query<{ total: string; published: string; pending: string; draft: string; rejected: string }>(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'published') AS published,
           COUNT(*) FILTER (WHERE status = 'pending') AS pending,
           COUNT(*) FILTER (WHERE status = 'draft') AS draft,
           COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
         FROM courses`
      ),
      query<{ total: string; completed: string }>(
        `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'completed') AS completed FROM enrollments`
      ),
      query<{ total: string }>(`SELECT COUNT(*) AS total FROM certificates`),
      query<{ total: string }>(`SELECT COUNT(*) AS total FROM categories`),
    ]);

    return {
      totalStudents: Number(users.rows[0].total_students),
      totalTeachers: Number(users.rows[0].total_teachers),
      courses: {
        total: Number(courses.rows[0].total),
        published: Number(courses.rows[0].published),
        pending: Number(courses.rows[0].pending),
        draft: Number(courses.rows[0].draft),
        rejected: Number(courses.rows[0].rejected),
      },
      enrollments: {
        total: Number(enrollments.rows[0].total),
        completed: Number(enrollments.rows[0].completed),
      },
      totalCertificates: Number(certificates.rows[0].total),
      totalCategories: Number(categories.rows[0].total),
    };
  },

  // --- Certificates oversight ---

  async findAllCertificates(params: { search?: string; page: number; limit: number }) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(
        `(u.full_name ILIKE $${values.length} OR c.title ILIKE $${values.length} OR cert.certificate_number ILIKE $${values.length})`
      );
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(params.limit, toOffset(params));

    const result = await query(
      `SELECT cert.id, cert.certificate_number, cert.pdf_url, cert.issued_at,
              u.full_name AS student_name, c.title AS course_title,
              COUNT(*) OVER() AS total_count
       FROM certificates cert
       JOIN users u ON u.id = cert.student_id
       JOIN courses c ON c.id = cert.course_id
       ${whereClause}
       ORDER BY cert.issued_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    const total = Number(result.rows[0]?.total_count ?? 0);
    return { rows: result.rows, total };
  },
};
