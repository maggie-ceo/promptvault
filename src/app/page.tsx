import Link from 'next/link';
import { supabase } from '@/lib/supabase';

async function getFeaturedCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(8);
  return data || [];
}

async function getTrendingPrompts() {
  const { data } = await supabase
    .from('prompts')
    .select('*')
    .eq('status', 'published')
    .order('likes_count', { ascending: false })
    .limit(6);
  return data || [];
}

async function getLatestPrompts() {
  const { data } = await supabase
    .from('prompts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);
  return data || [];
}

export default async function HomePage() {
  const [categories, trending, latest] = await Promise.all([
    getFeaturedCategories(),
    getTrendingPrompts(),
    getLatestPrompts(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-[var(--foreground)] mb-4">
          PromptVault
        </h1>
        <p className="text-xl text-[var(--muted)] mb-8 max-w-2xl mx-auto">
          A curated, community-powered library of practical AI prompts. Discover ready-to-use prompts for writing, coding, marketing, research, productivity, and more.
        </p>
        <div className="flex justify-center gap-4 mb-12">
          <Link href="/prompts" className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition">
            Browse Prompts
          </Link>
          <Link href="/submit" className="px-6 py-3 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--surface)] transition">
            Submit a Prompt
          </Link>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="px-4 py-12 max-w-[1440px] mx-auto">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-center hover:shadow-md transition"
            >
              <span className="text-3xl mb-2 block">{cat.icon || '📁'}</span>
              <h3 className="font-semibold text-[var(--foreground)]">{cat.name}</h3>
              <p className="text-sm text-[var(--muted)]">{cat.count} prompts</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Prompts */}
      <section className="px-4 py-12 max-w-[1440px] mx-auto">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Trending Prompts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/prompts/${prompt.id}`}
              className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:shadow-md transition"
            >
              <h3 className="font-semibold text-[var(--foreground)] mb-2">{prompt.title}</h3>
              <p className="text-sm text-[var(--muted)] line-clamp-2">{prompt.content?.substring(0, 100)}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-[var(--muted)]">
                <span>❤️ {prompt.likes_count || 0}</span>
                <span>📋 {prompt.copies_count || 0}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="px-4 py-12 max-w-[1440px] mx-auto">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Prompts for Developers</h3>
            <p className="text-sm text-[var(--muted)]">Coding, debugging, and system design prompts</p>
          </div>
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Prompts for Content Creators</h3>
            <p className="text-sm text-[var(--muted)]">Writing, marketing, and social media prompts</p>
          </div>
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Prompts for Students</h3>
            <p className="text-sm text-[var(--muted)]">Research, study, and academic prompts</p>
          </div>
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Prompts for Business</h3>
            <p className="text-sm text-[var(--muted)]">Strategy, sales, and productivity prompts</p>
          </div>
        </div>
      </section>

      {/* Why PromptVault */}
      <section className="px-4 py-12 max-w-[1440px] mx-auto">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Why PromptVault</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <span className="text-4xl mb-2 block">✅</span>
            <h3 className="font-semibold text-[var(--foreground)]">Curated Quality</h3>
            <p className="text-sm text-[var(--muted)]">Every prompt is reviewed before publishing</p>
          </div>
          <div className="text-center">
            <span className="text-4xl mb-2 block">📋</span>
            <h3 className="font-semibold text-[var(--foreground)]">Copy-Ready</h3>
            <p className="text-sm text-[var(--muted)]">One click to copy, then paste into your AI</p>
          </div>
          <div className="text-center">
            <span className="text-4xl mb-2 block">🆓</span>
            <h3 className="font-semibold text-[var(--foreground)]">Free & Open Source</h3>
            <p className="text-sm text-[var(--muted)]">No paywalls, no subscriptions, forever free</p>
          </div>
          <div className="text-center">
            <span className="text-4xl mb-2 block">👥</span>
            <h3 className="font-semibold text-[var(--foreground)]">Community Submitted</h3>
            <p className="text-sm text-[var(--muted)]">Built by and for the AI community</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 text-center bg-[var(--surface)] border-t border-[var(--border)]">
        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Have a prompt that works?
        </h2>
        <p className="text-lg text-[var(--muted)] mb-6">Share it with the community.</p>
        <Link href="/submit" className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition">
          Submit Your Prompt
        </Link>
      </section>
    </div>
  );
}
