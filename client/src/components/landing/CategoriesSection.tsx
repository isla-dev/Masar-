import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner } from '../common/Feedback';

const ICONS: Record<string, string> = {
  cooking: '🍳',
  sewing: '🧵',
  embroidery: '🪡',
  handcrafts: '✂️',
  beauty: '💄',
  business: '💼',
  'digital-skills': '💻',
  languages: '🌐',
};

const TINTS = ['bg-primary-50', 'bg-gold-50', 'bg-neutral-100'];

export function CategoriesSection() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="font-display text-3xl font-semibold text-neutral-900">{t('landing.categoriesTitle')}</h2>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories?.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/courses?category=${cat.id}`}
            className={`rounded-2xl ${TINTS[i % TINTS.length]} p-6 text-center transition-transform hover:-translate-y-1`}
          >
            <div className="text-3xl">{ICONS[cat.slug] ?? '📚'}</div>
            <p className="mt-3 font-display font-semibold text-neutral-900">
              {cat.name[language] ?? cat.name.en ?? cat.slug}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {cat.courseCount} {t('landing.coursesLabel')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
