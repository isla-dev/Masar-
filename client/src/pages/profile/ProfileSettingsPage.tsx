import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';

interface ProfileFormValues {
  fullName: string;
  preferredLanguage: 'en' | 'fr' | 'ar';
}

export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: { fullName: user?.full_name ?? '', preferredLanguage: user?.preferred_language ?? 'en' },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => usersApi.updateMe(values),
    onSuccess: (updated) => {
      updateUser(updated);
      // Re-sync the form's baseline so it doesn't look "unsaved" on next render.
      reset({ fullName: updated.full_name, preferredLanguage: updated.preferred_language });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (updated) => updateUser(updated),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
  } = useForm<{ currentPassword: string; newPassword: string }>();

  const passwordMutation = useMutation({
    mutationFn: (values: { currentPassword: string; newPassword: string }) =>
      usersApi.changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      setPasswordError(null);
      setPasswordSuccess(true);
      resetPasswordForm();
    },
    onError: (err: any) => {
      setPasswordSuccess(false);
      setPasswordError(err?.response?.data?.error?.message ?? t('auth.genericError'));
    },
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('profile.title')}</h1>

      <section className="mb-6 flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-neutral-100">
          {user.avatar_url && <img src={user.avatar_url} className="h-full w-full object-cover" />}
        </div>
        <Button variant="secondary" onClick={() => avatarInputRef.current?.click()} disabled={avatarMutation.isPending}>
          {t('profile.changeAvatar')}
        </Button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) avatarMutation.mutate(file);
            e.target.value = '';
          }}
        />
      </section>

      <form
        className="mb-6 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4"
        onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
      >
        <h2 className="font-semibold text-neutral-900">{t('profile.details')}</h2>
        <Input label={t('auth.fullName')} {...register('fullName', { required: true })} />
        <Input label={t('auth.email')} value={user.email} disabled className="opacity-60" />
        <Select
          label={t('profile.language')}
          options={[
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'Français' },
            { value: 'ar', label: 'العربية' },
          ]}
          {...register('preferredLanguage')}
        />
        <Button type="submit" disabled={updateMutation.isPending}>
          {t('common.save')}
        </Button>
        {updateMutation.isSuccess && <p className="text-sm text-primary-600">{t('profile.saved')}</p>}
      </form>

      <form
        className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4"
        onSubmit={handlePasswordSubmit((values) => passwordMutation.mutate(values))}
      >
        <h2 className="font-semibold text-neutral-900">{t('profile.changePassword')}</h2>
        <Input
          type="password"
          label={t('profile.currentPassword')}
          {...registerPassword('currentPassword', { required: true })}
        />
        <Input
          type="password"
          label={t('profile.newPassword')}
          {...registerPassword('newPassword', { required: true, minLength: 8 })}
        />
        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
        {passwordSuccess && <p className="text-sm text-primary-600">{t('profile.passwordChanged')}</p>}
        <Button type="submit" disabled={passwordMutation.isPending}>
          {t('profile.updatePassword')}
        </Button>
      </form>
    </div>
  );
}
