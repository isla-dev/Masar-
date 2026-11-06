// Temporary placeholder pages — each will be replaced with a real
// implementation in its own file during the relevant development phase.
import { useTranslation } from 'react-i18next';

function Placeholder({ label }: { label: string }) {
  return <div className="p-8 text-neutral-900">{label}</div>;
}

export function HomePage() {
  const { t } = useTranslation();
  return <Placeholder label={t('nav.home')} />;
}
