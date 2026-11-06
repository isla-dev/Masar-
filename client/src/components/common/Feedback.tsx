export function Badge({ children, tone = 'primary' }: { children: React.ReactNode; tone?: 'primary' | 'neutral' }) {
  const toneClasses =
    tone === 'primary' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-700';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
}

export function Spinner() {
  return (
    <div
      className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"
      role="status"
      aria-label="loading"
    />
  );
}
