'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PromptCard from '@/components/PromptCard';
import Link from 'next/link';

function BrowsePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [page, selectedType, selectedCategory, selectedTags, sortBy, search]);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    setCategories(data || []);
  }

  async function loadTags() {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('count', { ascending: false })
      .limit(50);
    setTags(data || []);
  }

  async function loadPrompts() {
    setLoading(true);
    try {
      let query = supabase
        .from('prompts')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      if (selectedType) {
        query = query.eq('type', selectedType);
      }

      if (selectedCategory) {
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', selectedCategory)
          .single();
        if (catData) {
          const { data: promptIds } = await supabase
            .from('prompt_categories')
            .select('prompt_id')
            .eq('category_id', catData.id);
          if (promptIds && promptIds.length > 0) {
            query = query.in('id', promptIds.map(p => p.prompt_id));
          }
        }
      }

      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }

      if (search) {
        query = query.textSearch('search_vector', search, { type: 'websearch' });
      }

      if (sortBy === 'popular') {
        query = query.order('likes_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error) {
        setPrompts(data || []);
        setTotal(count || 0);
      }
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPrompts();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-20 space-y-6">
            {/* Search */}
            <div>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>

            {/* AI Search Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">AI Search</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
              </button>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="prompt">Prompts</option>
                <option value="skill">Skills</option>
                <option value="workflow">Workflows</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.filter(c => !c.parent_id).map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Newest</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {tags.map(tag => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">{tag.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">({tag.count})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => { setSelectedCategory(''); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.filter(c => !c.parent_id).map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-500">
            {total} prompt{total !== 1 ? 's' : ''} found
          </div>

          {/* Prompts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No prompts found.</p>
              <Link href="/submit" className="text-blue-600 hover:underline mt-2 inline-block">
                Be the first to submit one!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {prompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <button
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Prev
                </button>
              )}
              <span className="px-4 py-2 text-gray-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-72 flex-shrink-0 hidden xl:block">
          <div className="sticky top-20 space-y-6">
            {/* Featured Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">🚀 CodeRabbit</h3>
              <p className="text-sm text-blue-100 mb-4">
                AI Code Review Assistant - Expert code reviewer for your team
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Code Review</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Development</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Security</span>
              </div>
              <a
                href="#"
                className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
              >
                Learn More
              </a>
            </div>

            {/* Submit CTA */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Share Your Prompt</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have a great prompt? Share it with the community!
              </p>
              <Link
                href="/submit"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                + Create Prompt
              </Link>
            </div>

            {/* Popular Tags */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 15).map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.name)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-700"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>}>
      <BrowsePageContent />
    </Suspense>
  );
}
