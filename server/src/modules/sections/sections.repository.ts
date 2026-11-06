import { query } from '../../config/db';

export const sectionsRepository = {
  /** Verifies the course exists and belongs to teacherId; returns it or null. */
  async findCourseIfOwned(courseId: string, teacherId: string) {
    const result = await query('SELECT id FROM courses WHERE id = $1 AND teacher_id = $2', [
      courseId,
      teacherId,
    ]);
    return result.rows[0] ?? null;
  },

  async create(courseId: string, title: string) {
    const orderResult = await query<{ next_order: number }>(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM sections WHERE course_id = $1`,
      [courseId]
    );
    const nextOrder = orderResult.rows[0].next_order;

    const result = await query(
      `INSERT INTO sections (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING *`,
      [courseId, title, nextOrder]
    );
    return result.rows[0];
  },

  async findByCourse(courseId: string) {
    const result = await query('SELECT * FROM sections WHERE course_id = $1 ORDER BY order_index ASC', [
      courseId,
    ]);
    return result.rows;
  },

  /** Returns the section only if its course is owned by teacherId, else null. */
  async findOwnedById(sectionId: string, teacherId: string) {
    const result = await query(
      `SELECT s.* FROM sections s
       JOIN courses c ON c.id = s.course_id
       WHERE s.id = $1 AND c.teacher_id = $2`,
      [sectionId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async updateOwned(sectionId: string, teacherId: string, data: { title?: string; orderIndex?: number }) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) {
      values.push(data.title);
      fields.push(`title = $${values.length}`);
    }
    if (data.orderIndex !== undefined) {
      values.push(data.orderIndex);
      fields.push(`order_index = $${values.length}`);
    }
    if (fields.length === 0) return this.findOwnedById(sectionId, teacherId);

    values.push(sectionId, teacherId);
    const result = await query(
      `UPDATE sections s SET ${fields.join(', ')}
       FROM courses c
       WHERE s.course_id = c.id AND s.id = $${values.length - 1} AND c.teacher_id = $${values.length}
       RETURNING s.*`,
      values
    );
    return result.rows[0] ?? null;
  },

  async deleteOwned(sectionId: string, teacherId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM sections s USING courses c
       WHERE s.course_id = c.id AND s.id = $1 AND c.teacher_id = $2`,
      [sectionId, teacherId]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
