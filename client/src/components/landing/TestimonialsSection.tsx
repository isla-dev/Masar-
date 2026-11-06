import { useTranslation } from 'react-i18next';

const TESTIMONIALS = [
  { name: 'Yasmine Cherif', course: 'Professional Sewing for Beginners', key: 't1' },
  { name: 'Nour Belkacem', course: 'Master Homemade Pastries', key: 't2' },
  { name: 'Imane Haddad', course: 'Start Your Small Business', key: 't3' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('');
}

export function TestimonialsSection() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="text-center font-display text-3xl font-semibold text-neutral-900">
        {t('landing.testimonialsTitle')}
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <div key={testimonial.key} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-gold-500">★★★★★</div>
            <p className="mt-3 text-sm text-neutral-700">"{t(`landing.testimonial.${testimonial.key}`)}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {initials(testimonial.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{testimonial.name}</p>
                <p className="text-xs text-neutral-500">{testimonial.course}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
