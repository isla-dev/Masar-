import { useTranslation } from 'react-i18next';

const FEATURES = [
  { icon: '⏱️', key: 'ownPace' },
  { icon: '🧑‍🏫', key: 'expertInstructors' },
  { icon: '🛠️', key: 'practicalProjects' },
  { icon: '📝', key: 'quizzesAssignments' },
  { icon: '🏆', key: 'earnCertificates' },
  { icon: '📱', key: 'learnAnywhere' },
];

export function BenefitsSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center font-display text-3xl font-semibold text-neutral-900">
          {t('landing.benefitsTitle')}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.key} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-display font-semibold text-neutral-900">{t(`landing.benefit.${f.key}.title`)}</h3>
              <p className="mt-1 text-sm text-neutral-600">{t(`landing.benefit.${f.key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
