import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

const DASHBOARD_BY_ROLE: Record<string, string> = {
  student: '/dashboard/student',
  teacher: '/dashboard/teacher',
  admin: '/dashboard/admin',
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit } = useForm<RegisterFormValues>({ defaultValues: { role: 'student' } });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await registerUser({ ...values, preferredLanguage: language });
      navigate(DASHBOARD_BY_ROLE[user.role] ?? '/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? t('auth.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('auth.registerTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label={t('auth.fullName')} {...register('fullName', { required: true })} />
        <Input type="email" label={t('auth.email')} {...register('email', { required: true })} />
        <Input
          type="password"
          label={t('auth.password')}
          {...register('password', { required: true, minLength: 8 })}
        />
        <Select
          label={t('auth.iAmA')}
          options={[
            { value: 'student', label: t('auth.roleStudent') },
            { value: 'teacher', label: t('auth.roleTeacher') },
          ]}
          {...register('role')}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('auth.submit')}
        </Button>
      </form>

      <p className="mt-4 text-sm text-neutral-600">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          {t('nav.login')}
        </Link>
      </p>
    </div>
  );
}
