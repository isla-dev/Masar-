import { query } from '../../config/db';
import { toOffset } from '../../utils/pagination';
import { ListCoursesQuery } from './courses.validation';

export interface CourseListRow {
  id: string;
  title: string;
  thumbnail_url: string | null;
  level: string;
  price: string;
  is_free: boolean;
  language: string;
  category_id: string | null;
  category_slug: string | null;
  teacher_id: string;
  teacher_name: string;
  lecture_count: number;
  avg_rating: number | null;
  review_count: number;
  total_count: number; // window count, same value on every row
}

export interface CreateCourseInput {
  teacherId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isFree: boolean;
  language: 'en' | 'fr' | 'ar';
}

export interface UpdateCourseInput {
  categoryId?: string | null;
  title?: string;
  description?: string | null;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  isFree?: boolean;
  language?: 'en' | 'fr' | 'ar';
}

export const coursesRepository = {
  async findPublished(params: ListCoursesQuery): Promise<{ rows: CourseListRow[]; total: number }> {
    const { search, category, level, language, isFree, page, limit } = params;

    const conditions: string[] = [`c.status = 'published'`];
    const values: unknown[] = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`c.title ILIKE $${values.length}`);
    }
    if (category) {
      values.push(category);
      conditions.push(`c.category_id = $${values.length}`);
    }
    if (level) {
      values.push(level);
      conditions.push(`c.level = $${values.length}`);
    }
    if (language) {
      values.push(language);
      conditions.push(`c.language = $${values.length}`);
    }
    if (isFree !== undefined) {
      values.push(isFree);
      conditions.push(`c.is_free = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');
    values.push(limit, toOffset({ page, limit }));

    const sql = `
      SELECT
        c.id, c.title, c.thumbnail_url, c.level, c.price, c.is_free, c.language,
        c.category_id, cat.slug AS category_slug,
        c.teacher_id, u.full_name AS teacher_name,
        COALESCE(lc.lecture_count, 0) AS lecture_count,
        COALESCE(rv.avg_rating, NULL) AS avg_rating,
        COALESCE(rv.review_count, 0) AS review_count,
        COUNT(*) OVER() AS total_count
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      LEFT JOIN categories cat ON cat.id = c.category_id
      LEFT JOIN (
        SELECT s.course_id, COUNT(l.id) AS lecture_count
        FROM sections s
        JOIN lectures l ON l.section_id = s.id
        GROUP BY s.course_id
      ) lc ON lc.course_id = c.id
      LEFT JOIN (
        SELECT course_id, AVG(rating)::NUMERIC(3,2) AS avg_rating, COUNT(*) AS review_count
        FROM reviews
        GROUP BY course_id
      ) rv ON rv.course_id = c.id
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const result = await query<CourseListRow>(sql, values);
    const total = result.rows[0]?.total_count ?? 0;
    return { rows: result.rows, total: Number(total) };
  },

  async findPublishedById(id: string) {
    const courseResult = await query(
      `SELECT
         c.id, c.title, c.description, c.thumbnail_url, c.level, c.price, c.is_free,
         c.language, c.status, c.created_at,
         c.category_id, cat.slug AS category_slug,
         c.teacher_id, u.full_name AS teacher_name, u.avatar_url AS teacher_avatar,
         COALESCE(rv.avg_rating, NULL) AS avg_rating,
         COALESCE(rv.review_count, 0) AS review_count
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       LEFT JOIN (
         SELECT course_id, AVG(rating)::NUMERIC(3,2) AS avg_rating, COUNT(*) AS review_count
         FROM reviews
         WHERE course_id = $1
         GROUP BY course_id
       ) rv ON rv.course_id = c.id
       WHERE c.id = $1 AND c.status = 'published'`,
      [id]
    );

    const course = courseResult.rows[0];
    if (!course) return null;

    const curriculumResult = await query(
      `SELECT
         s.id AS section_id, s.title AS section_title, s.order_index AS section_order,
         l.id AS lecture_id, l.title AS lecture_title, l.content_type, l.duration_seconds,
         l.order_index AS lecture_order
       FROM sections s
       LEFT JOIN lectures l ON l.section_id = s.id
       WHERE s.course_id = $1
       ORDER BY s.order_index ASC, l.order_index ASC`,
      [id]
    );

    const countsResult = await query(
      `SELECT
         (SELECT COUNT(*) FROM sections WHERE course_id = $1) AS section_count,
         (SELECT COUNT(*) FROM lectures l JOIN sections s ON s.id = l.section_id WHERE s.course_id = $1) AS lecture_count,
         (SELECT COUNT(*) FROM quizzes q JOIN sections s ON s.id = q.section_id WHERE s.course_id = $1) AS quiz_count,
         (SELECT COUNT(*) FROM assignments a JOIN sections s ON s.id = a.section_id WHERE s.course_id = $1) AS assignment_count`,
      [id]
    );

    return {
      course,
      curriculumRows: curriculumResult.rows,
      counts: countsResult.rows[0],
    };
  },

  /** Used by the public course detail endpoint to show enrollment state for a logged-in student. */
  async findEnrollmentStatus(courseId: string, studentId: string) {
    const result = await query(
      `SELECT status FROM enrollments WHERE course_id = $1 AND student_id = $2`,
      [courseId, studentId]
    );
    return result.rows[0]?.status as 'active' | 'completed' | undefined;
  },

  /** Raw row lookup regardless of status/ownership — used internally for ownership checks. */
  async findRawById(id: string) {
    const result = await query('SELECT * FROM courses WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async create(input: CreateCourseInput) {
    const result = await query(
      `INSERT INTO courses (teacher_id, category_id, title, description, level, price, is_free, status, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8)
       RETURNING *`,
      [
        input.teacherId,
        input.categoryId,
        input.title,
        input.description,
        input.level,
        input.price,
        input.isFree,
        input.language,
      ]
    );
    return result.rows[0];
  },

  /** Updates only if the course belongs to teacherId. Returns null if not found/not owned. */
  async updateOwned(id: string, teacherId: string, input: UpdateCourseInput) {
    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, unknown> = {
      category_id: input.categoryId,
      title: input.title,
      description: input.description,
      level: input.level,
      price: input.price,
      is_free: input.isFree,
      language: input.language,
    };

    for (const [column, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    }

    if (fields.length === 0) return this.findRawById(id);

    fields.push(`updated_at = now()`);
    values.push(id, teacherId);

    const result = await query(
      `UPDATE courses SET ${fields.join(', ')}
       WHERE id = $${values.length - 1} AND teacher_id = $${values.length}
       RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  },

  async deleteOwned(id: string, teacherId: string): Promise<boolean> {
    const result = await query('DELETE FROM courses WHERE id = $1 AND teacher_id = $2', [id, teacherId]);
    return (result.rowCount ?? 0) > 0;
  },

  async setThumbnailOwned(id: string, teacherId: string, url: string) {
    const result = await query(
      `UPDATE courses SET thumbnail_url = $1, updated_at = now()
       WHERE id = $2 AND teacher_id = $3 RETURNING *`,
      [url, id, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async submitForReviewOwned(id: string, teacherId: string) {
    const result = await query(
      `UPDATE courses SET status = 'pending', updated_at = now()
       WHERE id = $1 AND teacher_id = $2 AND status IN ('draft', 'rejected')
       RETURNING *`,
      [id, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async findMine(teacherId: string, params: { page: number; limit: number; status?: string }) {
    const conditions = ['c.teacher_id = $1'];
    const values: unknown[] = [teacherId];

    if (params.status) {
      values.push(params.status);
      conditions.push(`c.status = $${values.length}`);
    }

    values.push(params.limit, (params.page - 1) * params.limit);

    const result = await query(
      `SELECT
         c.*,
         cat.slug AS category_slug,
         COALESCE(en.enrollment_count, 0) AS enrollment_count,
         COUNT(*) OVER() AS total_count
       FROM courses c
       LEFT JOIN categories cat ON cat.id = c.category_id
       LEFT JOIN (
         SELECT course_id, COUNT(*) AS enrollment_count FROM enrollments GROUP BY course_id
       ) en ON en.course_id = c.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY c.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const total = Number(result.rows[0]?.total_count ?? 0);
    return { rows: result.rows, total };
  },
};
