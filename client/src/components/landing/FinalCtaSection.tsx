import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';

export function FinalCtaSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-gold-500 py-16 text-center">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="font-display text-3xl font-semibold text-primary-900 sm:text-4xl">
          {t('landing.finalCtaTitle')}
        </h2>
        <p className="mt-3 text-primary-900/80">{t('landing.finalCtaDescription')}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/courses">
            <Button className="!bg-primary-900 hover:!bg-primary-800">{t('landing.exploreCourses')}</Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" className="!border-primary-900 !bg-transparent !text-primary-900 hover:!bg-primary-900/10">
              {t('landing.createFreeAccount')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
