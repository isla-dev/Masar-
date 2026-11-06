import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Spinner } from '../../components/common/Feedback';
import { Input } from '../../components/common/Input';
import { Pagination } from '../../components/common/Pagination';

export default function AdminCertificatesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-certificates', search, page],
    queryFn: () => adminApi.listCertificates({ search: search || undefined, page, limit: 20 }),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('admin.certificates')}</h1>

      <Input
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4"
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {data?.data.map((cert) => (
          <a
            key={cert.id}
            href={cert.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm hover:shadow-sm"
          >
            <div>
              <p className="font-medium text-neutral-900">{cert.studentName}</p>
              <p className="text-xs text-neutral-500">
                {cert.courseTitle} · {cert.certificateNumber}
              </p>
            </div>
            <span className="text-xs text-neutral-400">{new Date(cert.issuedAt).toLocaleDateString()}</span>
          </a>
        ))}
      </div>

      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
