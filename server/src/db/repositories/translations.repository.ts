import { query } from '../../config/db';
import { AppLanguage } from '../types';

export type TranslationMap = Partial<Record<AppLanguage, string>>;

/**
 * Fetches translations for a batch of entities of the same type/field in one
 * query, and groups them by entity id: { [entityId]: { en, fr, ar } }.
 * Used so list endpoints don't run N+1 translation queries.
 */
export async function getTranslationsForEntities(
  entityType: string,
  entityIds: string[],
  fieldName: string
): Promise<Record<string, TranslationMap>> {
  if (entityIds.length === 0) return {};

  const result = await query<{ entity_id: string; language: AppLanguage; value: string }>(
    `SELECT entity_id, language, value
     FROM translations
     WHERE entity_type = $1 AND field_name = $2 AND entity_id = ANY($3::uuid[])`,
    [entityType, fieldName, entityIds]
  );

  const map: Record<string, TranslationMap> = {};
  for (const row of result.rows) {
    map[row.entity_id] = map[row.entity_id] ?? {};
    map[row.entity_id][row.language] = row.value;
  }
  return map;
}

/**
 * Upserts one translation value (used by admin/teacher content management).
 */
export async function setTranslation(
  entityType: string,
  entityId: string,
  fieldName: string,
  language: AppLanguage,
  value: string
): Promise<void> {
  await query(
    `INSERT INTO translations (entity_type, entity_id, field_name, language, value)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (entity_type, entity_id, field_name, language)
     DO UPDATE SET value = EXCLUDED.value`,
    [entityType, entityId, fieldName, language, value]
  );
}
