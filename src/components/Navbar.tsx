import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
            PromptVault
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/prompts" className="text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors">
              Prompts
            </Link>
            <Link href="/categories" className="text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors">
              Categories
            </Link>
            <Link href="/tags" className="text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors">
              Tags
            </Link>
            <Link href="/prompts?type=skill" className="text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors">
              Skills
            </Link>
            <Link href="/prompts?type=workflow" className="text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors">
              Workflows
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/submit"
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + Submit
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
