import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Spinner } from '../../components/common/Feedback';

type StatTone = 'primary' | 'neutral' | 'amber';
const TONE_CLASSES: Record<StatTone, string> = {
  primary: 'bg-primary-50 text-primary-700',
  neutral: 'bg-neutral-100 text-neutral-600',
  amber: 'bg-amber-50 text-amber-700',
};

function StatCard({ label, value, icon, tone = 'neutral' }: { label: string; value: string | number; icon: string; tone?: StatTone }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-lg ${TONE_CLASSES[tone]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('admin.overview')}</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label={t('admin.totalStudents')} value={data.totalStudents} icon="👩‍🎓" tone="primary" />
        <StatCard label={t('admin.totalTeachers')} value={data.totalTeachers} icon="🧑‍🏫" tone="primary" />
        <StatCard label={t('teacher.totalCourses')} value={data.courses.total} icon="📚" tone="neutral" />
        <StatCard label={t('courseStatus.published')} value={data.courses.published} icon="✅" tone="primary" />
        <StatCard label={t('courseStatus.pending')} value={data.courses.pending} icon="⏳" tone="amber" />
        <StatCard label={t('courseStatus.draft')} value={data.courses.draft} icon="📝" tone="neutral" />
        <StatCard label={t('admin.totalEnrollments')} value={data.enrollments.total} icon="🎓" tone="neutral" />
        <StatCard label={t('student.certificates')} value={data.totalCertificates} icon="🏆" tone="primary" />
      </div>
    </div>
  );
}
