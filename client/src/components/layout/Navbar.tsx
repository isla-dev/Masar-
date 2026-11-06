import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';
import { Button } from '../common/Button';
import logo from '../../assets/logo.png';

const DASHBOARD_BY_ROLE: Record<string, string> = {
  student: '/dashboard/student',
  teacher: '/dashboard/teacher',
  admin: '/dashboard/admin',
};

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = { en: 'EN', fr: 'FR', ar: 'AR' };

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-0.5">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            language === lang ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/courses${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
    setMobileSearchOpen(false);
  }

  const navLinks = [
    { to: '/courses', label: t('nav.categories') },
    { to: '/courses', label: t('nav.courses') },
    { to: '/courses?isFree=true', label: t('nav.freeCourses') },
    { to: '/certificates', label: t('nav.certificates') },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src={logo} alt="Masar+" className="h-9 w-9 object-contain" />
          <span className="font-display text-lg font-semibold text-primary-700">Masar+</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-700 lg:flex">
          {navLinks.map((link, i) => (
            <Link key={i} to={link.to} className="whitespace-nowrap hover:text-primary-700">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="mx-auto hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full rounded-full border border-neutral-200 bg-white py-2 ps-4 pe-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              type="submit"
              aria-label={t('common.search')}
              className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-neutral-400 hover:text-primary-600"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Desktop right side */}
        <div className="ms-auto hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to={DASHBOARD_BY_ROLE[user.role] ?? '/'} className="text-sm font-medium text-neutral-700 hover:text-primary-700">
                {t('nav.dashboard')}
              </Link>
              <Link to="/profile" className="text-sm font-medium text-neutral-700 hover:text-primary-700">
                {t('nav.profile')}
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                {t('auth.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-neutral-700 hover:text-primary-700">
                {t('nav.login')}
              </Link>
              <Link to="/register">
                <Button>{t('nav.register')}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="ms-auto flex items-center gap-2 md:hidden">
          <button
            aria-label={t('common.search')}
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
          >
            🔍
          </button>
          <button
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <form onSubmit={submitSearch} className="border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('nav.searchPlaceholder')}
            className="w-full rounded-full border border-neutral-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </form>
      )}

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-neutral-700">
            {navLinks.map((link, i) => (
              <Link key={i} to={link.to} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <LanguageSwitcher />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link to={DASHBOARD_BY_ROLE[user.role] ?? '/'} onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    {t('nav.profile')}
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="w-full">
                  {t('auth.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">{t('nav.register')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
