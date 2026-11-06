import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';

export function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/courses${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
  }

  return (
    <section className="relative overflow-hidden bg-primary-900">
      {/* Subtle texture: soft radial glow, not a generic gradient blob */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 15% 20%, rgba(184,134,46,0.25), transparent), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(184,134,46,0.15), transparent)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-rise-in">
          <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-primary-100">{t('landing.heroSubtitle')}</p>

          <form onSubmit={submitSearch} className="mt-8 flex max-w-md gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full rounded-full border-0 bg-white px-5 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-gold-400"
            >
              {t('common.search')}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/courses')} className="!bg-gold-500 !text-primary-900 hover:!bg-gold-400">
              {t('landing.exploreCourses')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/courses?isFree=true')}
              className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
            >
              {t('landing.startLearningFree')}
            </Button>
          </div>
        </div>

        <div className="relative animate-rise-in" style={{ animationDelay: '120ms' }}>
          <div className="overflow-hidden rounded-3xl">
            <img
              src="https://images.pexels.com/photos/6001377/pexels-photo-6001377.jpeg?auto=format&fit=crop&w=1200&q=80"
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-6 start-4 rounded-2xl bg-white px-4 py-3 shadow-lg">
            <p className="font-display text-lg font-semibold text-primary-700">10,000+</p>
            <p className="text-xs text-neutral-500">{t('landing.students')}</p>
          </div>
          <div className="absolute -top-5 end-4 rounded-2xl bg-white px-4 py-3 shadow-lg">
            <p className="font-display text-lg font-semibold text-primary-700">500+</p>
            <p className="text-xs text-neutral-500">{t('landing.coursesLabel')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
