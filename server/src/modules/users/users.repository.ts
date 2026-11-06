import { query, withTransaction } from '../../config/db';
import { UserRole, UserRow } from '../../db/types';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  preferredLanguage: 'en' | 'fr' | 'ar';
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  preferredLanguage?: 'en' | 'fr' | 'ar';
}

export const usersRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ?? null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const result = await query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async updateProfile(id: string, input: UpdateProfileInput): Promise<UserRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const fieldMap: Record<string, unknown> = {
      full_name: input.fullName,
      avatar_url: input.avatarUrl,
      preferred_language: input.preferredLanguage,
    };
    for (const [column, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }
    }
    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = now()');
    values.push(id);
    const result = await query<UserRow>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  },

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, id]);
  },

  /**
   * Creates the base user row plus the role-specific profile row in a
   * single transaction, so we never end up with a user missing its profile.
   */
  async create(input: CreateUserInput): Promise<UserRow> {
    return withTransaction(async (client) => {
      const userResult = await client.query<UserRow>(
        `INSERT INTO users (email, password_hash, full_name, role, preferred_language)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [input.email, input.passwordHash, input.fullName, input.role, input.preferredLanguage]
      );
      const user = userResult.rows[0];

      if (input.role === 'student') {
        await client.query('INSERT INTO student_profiles (user_id) VALUES ($1)', [user.id]);
      } else if (input.role === 'teacher') {
        await client.query('INSERT INTO teacher_profiles (user_id) VALUES ($1)', [user.id]);
      }

      return user;
    });
  },
};
