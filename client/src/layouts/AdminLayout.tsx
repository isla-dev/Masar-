import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/layout/Navbar';

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { to: '/dashboard/admin', label: t('admin.overview') },
    { to: '/dashboard/admin/courses/pending', label: t('admin.pendingCourses') },
    { to: '/dashboard/admin/courses', label: t('admin.allCourses') },
    { to: '/dashboard/admin/users', label: t('admin.users') },
    { to: '/dashboard/admin/categories', label: t('admin.categories') },
    { to: '/dashboard/admin/certificates', label: t('admin.certificates') },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)]">
        <aside className="w-56 shrink-0 border-e border-neutral-200 bg-white p-4">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 bg-neutral-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
