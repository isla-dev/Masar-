import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATS = [
  { value: 10000, suffix: '+', key: 'students' },
  { value: 500, suffix: '+', key: 'courses' },
  { value: 100, suffix: '+', key: 'instructors' },
  { value: 20, suffix: '+', key: 'categories' },
];

function Counter({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1200;
          const start = performance.now();
          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export function StatsSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-primary-900 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.key}>
            <p className="font-display text-4xl font-semibold text-gold-400">
              <Counter target={stat.value} />
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm text-primary-100">{t(`landing.stat.${stat.key}`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
