import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found — PromptVault',
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[var(--foreground)] mb-4">404</h1>
        <p className="text-lg text-[var(--muted)] mb-2">Page not found</p>
        <p className="text-sm text-[var(--muted)] mb-6">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            Go Home
          </Link>
          <Link
            href="/prompts"
            className="px-6 py-2 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--background)]"
          >
            Browse Prompts
          </Link>
        </div>
      </div>
    </div>
  );
}
