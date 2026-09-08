import Link from 'next/link';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Prompt } from '@/lib/types';
import PromptCard from '@/components/PromptCard';
import SearchBar from '@/components/SearchBar';

async function getFeaturedPrompts(): Promise<Prompt[]> {
  const { data } = await supabase
    .from('prompts')
    .select('*')
    .eq('status', 'published')
    .order('likes_count', { ascending: false })
    .limit(6);
  
  return data || [];
}

async function getLatestPrompts(): Promise<Prompt[]> {
  const { data } = await supabase
    .from('prompts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);
  
  return data || [];
}

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    getFeaturedPrompts(),
    getLatestPrompts(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          PromptVault
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The Free &amp; Open Source AI Prompts Library. Share, discover, and collect the best prompts from the community.
        </p>
        <div className="flex justify-center gap-4 mb-12">
          <Link href="/prompts" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Browse Prompts
          </Link>
          <Link href="/submit" className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
            Submit Prompt
          </Link>
        </div>
        <Suspense fallback={<div className="h-12" />}>
          <SearchBar />
        </Suspense>
      </section>

      {/* Featured */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Prompts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Prompts</h2>
          <Link href="/prompts?sort=latest" className="text-blue-600 hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Built for the Community</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold">100%</div>
              <div className="text-gray-400">Open Source</div>
            </div>
            <div>
              <div className="text-4xl font-bold">Free</div>
              <div className="text-gray-400">Forever</div>
            </div>
            <div>
              <div className="text-4xl font-bold">∞</div>
              <div className="text-gray-400">Possibilities</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
