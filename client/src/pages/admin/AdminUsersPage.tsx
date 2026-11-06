import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Spinner, Badge } from '../../components/common/Feedback';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminApi.listUsers({ search: search || undefined, role: role || undefined, page, limit: 20 }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.setUserActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('admin.users')}</h1>

      <div className="mb-4 flex gap-3">
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1"
        />
        <Select
          placeholder={t('admin.allRoles')}
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'student', label: t('auth.roleStudent') },
            { value: 'teacher', label: t('auth.roleTeacher') },
          ]}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {data?.data.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-sm"
          >
            <div>
              <p className="font-medium text-neutral-900">{user.fullName}</p>
              <p className="text-xs text-neutral-500">
                {user.email} · {t(`auth.role${user.role === 'student' ? 'Student' : 'Teacher'}`)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={user.isActive ? 'primary' : 'neutral'}>
                {user.isActive ? t('admin.active') : t('admin.inactive')}
              </Badge>
              <Button
                variant="ghost"
                onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: !user.isActive })}
                disabled={toggleActiveMutation.isPending}
              >
                {user.isActive ? t('admin.deactivate') : t('admin.activate')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
