import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';
import logo from '../../assets/logo.png';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = { en: 'English', fr: 'Français', ar: 'العربية' };

export function Footer() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const columns = [
    {
      title: t('footer.platform'),
      links: [
        { label: t('footer.aboutUs'), href: '#' },
        { label: t('nav.courses'), to: '/courses' },
        { label: t('nav.freeCourses'), to: '/courses?isFree=true' },
        { label: t('nav.certificates'), to: '/certificates' },
        { label: t('landing.becomeInstructor'), to: '/register' },
      ],
    },
    {
      title: t('nav.categories'),
      links: [
        { label: t('footer.categoryCooking'), to: '/courses' },
        { label: t('footer.categorySewing'), to: '/courses' },
        { label: t('footer.categoryBeauty'), to: '/courses' },
        { label: t('footer.categoryBusiness'), to: '/courses' },
        { label: t('footer.categoryTechnology'), to: '/courses' },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('footer.helpCenter'), href: '#' },
        { label: t('footer.contactUs'), href: '#' },
        { label: t('footer.faq'), href: '#' },
        { label: t('footer.terms'), href: '#' },
        { label: t('footer.privacy'), href: '#' },
      ],
    },
  ];

  const social = ['Facebook', 'Instagram', 'YouTube', 'TikTok'];

  return (
    <footer className="bg-primary-900 pt-14 text-primary-100">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 pb-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Masar+" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-semibold text-white">Masar+</span>
          </Link>
          <p className="mt-3 text-sm text-primary-200">{t('footer.tagline')}</p>

          <div className="mt-4 flex gap-3 text-xs text-primary-200">
            {social.map((s) => (
              <a key={s} href="#" className="hover:text-white">
                {s}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-primary-200">
              {col.links.map((link, i) => (
                <li key={i}>
                  {'to' in link && link.to !== undefined ? (
                    <Link to={link.to} className="hover:text-white">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={'href' in link ? link.href : '#'} className="hover:text-white">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-primary-300">
          <p>© {new Date().getFullYear()} Masar+. {t('footer.rights')}</p>
          <div className="flex gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={language === lang ? 'text-white' : 'hover:text-white'}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
