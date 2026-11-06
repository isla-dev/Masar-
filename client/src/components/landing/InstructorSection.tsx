import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';

export function InstructorSection() {
  const { t } = useTranslation();
  const benefits = ['createCourses', 'reachStudents', 'earnFromCourses', 'trackProgress'] as const;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid grid-cols-1 items-center gap-10 rounded-3xl bg-primary-900 p-10 lg:grid-cols-2 lg:p-16">
        <div className="overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div>
          <h2 className="font-display text-3xl font-semibold text-white">{t('landing.instructorTitle')}</h2>
          <p className="mt-3 text-primary-100">{t('landing.instructorDescription')}</p>

          <ul className="mt-6 flex flex-col gap-2 text-sm text-primary-100">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span className="text-gold-400">✓</span>
                {t(`landing.instructorBenefit.${b}`)}
              </li>
            ))}
          </ul>

          <Link to="/register" className="mt-6 inline-block">
            <Button className="!bg-gold-500 !text-primary-900 hover:!bg-gold-400">
              {t('landing.becomeInstructor')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
