import { query } from '../../config/db';

export const lecturesRepository = {
  /** Verifies the section exists and belongs (via its course) to teacherId. */
  async findSectionIfOwned(sectionId: string, teacherId: string) {
    const result = await query(
      `SELECT s.id FROM sections s
       JOIN courses c ON c.id = s.course_id
       WHERE s.id = $1 AND c.teacher_id = $2`,
      [sectionId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async create(
    sectionId: string,
    data: { title: string; contentType: 'video' | 'text' | 'file'; contentUrl?: string | null; durationSeconds?: number | null }
  ) {
    const orderResult = await query<{ next_order: number }>(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM lectures WHERE section_id = $1`,
      [sectionId]
    );
    const nextOrder = orderResult.rows[0].next_order;

    const result = await query(
      `INSERT INTO lectures (section_id, title, content_type, content_url, duration_seconds, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [sectionId, data.title, data.contentType, data.contentUrl ?? null, data.durationSeconds ?? null, nextOrder]
    );
    return result.rows[0];
  },

  async findByOwnedSection(sectionId: string, teacherId: string) {
    const result = await query(
      `SELECT l.* FROM lectures l
       JOIN sections s ON s.id = l.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE l.section_id = $1 AND c.teacher_id = $2
       ORDER BY l.order_index ASC`,
      [sectionId, teacherId]
    );
    return result.rows;
  },

  async findOwnedById(lectureId: string, teacherId: string) {
    const result = await query(
      `SELECT l.* FROM lectures l
       JOIN sections s ON s.id = l.section_id
       JOIN courses c ON c.id = s.course_id
       WHERE l.id = $1 AND c.teacher_id = $2`,
      [lectureId, teacherId]
    );
    return result.rows[0] ?? null;
  },

  async updateOwned(
    lectureId: string,
    teacherId: string,
    data: { title?: string; contentType?: string; contentUrl?: string | null; durationSeconds?: number | null; orderIndex?: number }
  ) {
    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, unknown> = {
      title: data.title,
      content_type: data.contentType,
      content_url: data.contentUrl,
      duration_seconds: data.durationSeconds,
      order_index: data.orderIndex,
    };
    for (const [column, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    }
    if (fields.length === 0) return this.findOwnedById(lectureId, teacherId);

    values.push(lectureId, teacherId);
    const result = await query(
      `UPDATE lectures l SET ${fields.join(', ')}
       FROM sections s, courses c
       WHERE l.section_id = s.id AND s.course_id = c.id
         AND l.id = $${values.length - 1} AND c.teacher_id = $${values.length}
       RETURNING l.*`,
      values
    );
    return result.rows[0] ?? null;
  },

  async deleteOwned(lectureId: string, teacherId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM lectures l USING sections s, courses c
       WHERE l.section_id = s.id AND s.course_id = c.id
         AND l.id = $1 AND c.teacher_id = $2`,
      [lectureId, teacherId]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
