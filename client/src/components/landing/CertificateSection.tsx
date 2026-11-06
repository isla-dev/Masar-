import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';

export function CertificateSection() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Certificate mockup — echoes the real generated certificate's palette/border */}
        <div className="rounded-2xl border-2 border-gold-400 bg-neutral-50 p-8 shadow-sm">
          <div className="rounded-xl border border-gold-300 p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">Masar+</p>
            <p className="mt-4 font-display text-xl font-semibold text-neutral-900">Certificate of Completion</p>
            <p className="mt-4 text-sm text-neutral-500">This certifies that</p>
            <p className="mt-1 font-display text-lg font-semibold text-primary-700">Yasmine Cherif</p>
            <p className="mt-4 text-sm text-neutral-500">has successfully completed</p>
            <p className="mt-1 font-medium text-neutral-900">Professional Sewing for Beginners</p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-3xl font-semibold text-neutral-900">{t('landing.certTitle')}</h2>
          <p className="mt-3 text-neutral-600">{t('landing.certDescription')}</p>
          <Link to="/courses" className="mt-6 inline-block">
            <Button>{t('landing.exploreCourses')}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
