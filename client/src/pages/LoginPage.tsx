import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

interface LoginFormValues {
  email: string;
  password: string;
}

const DASHBOARD_BY_ROLE: Record<string, string> = {
  student: '/dashboard/student',
  teacher: '/dashboard/teacher',
  admin: '/dashboard/admin',
};

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      navigate(DASHBOARD_BY_ROLE[user.role] ?? '/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? t('auth.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('auth.loginTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input type="email" label={t('auth.email')} {...register('email', { required: true })} />
        <Input type="password" label={t('auth.password')} {...register('password', { required: true })} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('auth.submit')}
        </Button>
      </form>

      <p className="mt-4 text-sm text-neutral-600">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          {t('nav.register')}
        </Link>
      </p>
    </div>
  );
}
