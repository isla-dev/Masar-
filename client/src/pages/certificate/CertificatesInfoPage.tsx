import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export default function CertificatesInfoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [certNumber, setCertNumber] = useState('');

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (certNumber.trim()) navigate(`/verify/${encodeURIComponent(certNumber.trim())}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-neutral-900">{t('certPage.title')}</h1>
      <p className="mx-auto mt-3 max-w-md text-neutral-600">{t('certPage.description')}</p>

      <form onSubmit={handleVerify} className="mx-auto mt-8 flex max-w-md gap-2">
        <Input
          placeholder={t('certPage.placeholder')}
          value={certNumber}
          onChange={(e) => setCertNumber(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">{t('certPage.verify')}</Button>
      </form>

      <p className="mt-10 text-sm text-neutral-500">{t('certPage.howItWorks')}</p>
    </div>
  );
}
