import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { Spinner } from '../../components/common/Feedback';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

function NewCategoryForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.create(slug, undefined, { en: nameEn, fr: nameFr, ar: nameAr }),
    onSuccess: onDone,
  });

  const isValid = slug.trim() && nameEn.trim() && nameFr.trim() && nameAr.trim();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4">
      <Input
        placeholder={t('admin.categorySlug')}
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
      />
      <Input placeholder="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      <Input placeholder="Nom (Français)" value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
      <Input placeholder="الاسم (عربي)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
      <Button disabled={!isValid || createMutation.isPending} onClick={() => createMutation.mutate()}>
        {t('common.save')}
      </Button>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{t('admin.categories')}</h1>
        <Button onClick={() => setIsAdding((v) => !v)}>{t('admin.newCategory')}</Button>
      </div>

      {isAdding && (
        <div className="mb-4">
          <NewCategoryForm
            onDone={() => {
              setIsAdding(false);
              queryClient.invalidateQueries({ queryKey: ['categories'] });
            }}
          />
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {categories?.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm"
          >
            <div>
              <p className="font-medium text-neutral-900">
                {cat.name.en} <span className="text-neutral-400">/ {cat.name.fr} / {cat.name.ar}</span>
              </p>
              <p className="text-xs text-neutral-500">{cat.slug}</p>
            </div>
            <button
              type="button"
              className="text-xs text-neutral-400 hover:text-red-500"
              onClick={() => deleteMutation.mutate(cat.id)}
            >
              {t('admin.deleteCategory')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
