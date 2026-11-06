import { AppError } from '../../utils/AppError';
import { categoriesRepository } from './categories.repository';
import {
  getTranslationsForEntities,
  setTranslation,
} from '../../db/repositories/translations.repository';

export interface CategoryNameInput {
  en: string;
  fr: string;
  ar: string;
}

export const categoriesService = {
  async listAll() {
    const categories = await categoriesRepository.findAll();
    const [names, courseCounts] = await Promise.all([
      getTranslationsForEntities(
        'category',
        categories.map((c) => c.id),
        'name'
      ),
      categoriesRepository.getPublishedCourseCounts(),
    ]);

    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      icon: c.icon,
      name: names[c.id] ?? {},
      courseCount: courseCounts[c.id] ?? 0,
    }));
  },

  async create(slug: string, icon: string | null, name: CategoryNameInput) {
    const category = await categoriesRepository.create(slug, icon);
    await Promise.all(
      (Object.entries(name) as ['en' | 'fr' | 'ar', string][]).map(([lang, value]) =>
        setTranslation('category', category.id, 'name', lang, value)
      )
    );
    return { id: category.id, slug: category.slug, icon: category.icon, name };
  },

  async update(id: string, data: { icon?: string | null; name?: Partial<CategoryNameInput> }) {
    const existing = await categoriesRepository.findById(id);
    if (!existing) throw AppError.notFound('Category not found');

    if (data.icon !== undefined) {
      await categoriesRepository.updateIcon(id, data.icon);
    }
    if (data.name) {
      await Promise.all(
        (Object.entries(data.name) as ['en' | 'fr' | 'ar', string][]).map(([lang, value]) =>
          setTranslation('category', id, 'name', lang, value)
        )
      );
    }

    const names = await getTranslationsForEntities('category', [id], 'name');
    return { id, slug: existing.slug, icon: data.icon ?? existing.icon, name: names[id] ?? {} };
  },

  async remove(id: string) {
    const deleted = await categoriesRepository.delete(id);
    if (!deleted) throw AppError.notFound('Category not found');
  },
};
