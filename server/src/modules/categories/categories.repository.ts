import { query } from '../../config/db';

export interface CategoryRow {
  id: string;
  slug: string;
  icon: string | null;
  created_at: Date;
}

export const categoriesRepository = {
  async findAll(): Promise<CategoryRow[]> {
    const result = await query<CategoryRow>('SELECT * FROM categories ORDER BY slug ASC');
    return result.rows;
  },

  async getPublishedCourseCounts(): Promise<Record<string, number>> {
    const result = await query<{ category_id: string; count: string }>(
      `SELECT category_id, COUNT(*) AS count
       FROM courses
       WHERE status = 'published' AND category_id IS NOT NULL
       GROUP BY category_id`
    );
    return Object.fromEntries(result.rows.map((r) => [r.category_id, Number(r.count)]));
  },

  async findById(id: string): Promise<CategoryRow | null> {
    const result = await query<CategoryRow>('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async create(slug: string, icon: string | null): Promise<CategoryRow> {
    const result = await query<CategoryRow>(
      'INSERT INTO categories (slug, icon) VALUES ($1, $2) RETURNING *',
      [slug, icon]
    );
    return result.rows[0];
  },

  async updateIcon(id: string, icon: string | null): Promise<CategoryRow | null> {
    const result = await query<CategoryRow>('UPDATE categories SET icon = $2 WHERE id = $1 RETURNING *', [
      id,
      icon,
    ]);
    return result.rows[0] ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM categories WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
