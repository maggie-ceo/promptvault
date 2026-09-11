'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PromptCard from '@/components/PromptCard';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

function BrowsePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const limit = 12;
  const requestId = useRef(0);

  // Initialize filters from URL
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

  // Sync URL when filters change
  const syncURL = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedType) params.set('type', selectedType);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (sortBy !== 'latest') params.set('sort', sortBy);
    if (page > 1) params.set('page', String(page));
    
    // Apply overrides
    for (const [k, v] of Object.entries(overrides)) {
      if (v !== undefined && v !== '') params.set(k, String(v));
      else params.delete(k);
    }

    const url = `/prompts${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(url, { scroll: false });
  };

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    setLoadState('loading');
    
    loadPrompts().then(() => {
      if (currentRequestId === requestId.current) {
        setLoadState('success');
      }
    }).catch(() => {
      if (currentRequestId === requestId.current) {
        setLoadState('error');
      }
    });

    syncURL({ page });
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
      .limit(30);
    setTags(data || []);
  }

  async function loadPrompts() {
    try {
      let query = supabase
        .from('prompts')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      if (selectedType) query = query.eq('type', selectedType);

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

      if (selectedTags.length > 0) query = query.contains('tags', selectedTags);

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
      throw err;
    }
  }

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSortBy('latest');
    setPage(1);
  };

  const activeFilterCount = [selectedType, selectedCategory, ...selectedTags].filter(Boolean).length;
  const totalPages = Math.ceil(total / limit);

  const showLoading = loadState === 'loading';
  const showEmpty = loadState === 'success' && prompts.length === 0;
  const showResults = loadState === 'success' && prompts.length > 0;
  const showError = loadState === 'error';

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Left Sidebar */}
        <aside className="w-[220px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-20 space-y-5">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search prompts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent bg-[var(--surface)]"
              />
            </form>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1.5">Type</label>
              <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setPage(1); }} className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)]">
                <option value="">All</option>
                <option value="prompt">Prompts</option>
                <option value="skill">Skills</option>
                <option value="workflow">Workflows</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1.5">Category</label>
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)]">
                <option value="">All Categories</option>
                {categories.filter(c => !c.parent_id).map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1.5">Sort by</label>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] bg-[var(--surface)]">
                <option value="latest">Newest</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1.5">Tags</label>
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {tags.map(tag => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input type="checkbox" checked={selectedTags.includes(tag.name)} onChange={() => handleTagToggle(tag.name)} className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                    <span className="text-sm text-[var(--foreground)]">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[28px] font-bold text-[var(--foreground)]">Prompts</h1>
              {showResults && <p className="text-sm text-[var(--muted)]">{total} prompts found</p>}
              {showLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-[var(--muted)]">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
              <button onClick={clearFilters} className="text-xs text-[var(--accent)] hover:underline">Clear all</button>
            </div>
          )}

          <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="lg:hidden mb-4 px-4 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)]">
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {mobileFiltersOpen && (
            <div className="lg:hidden mb-6 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] space-y-4">
              <form onSubmit={handleSearch}>
                <input type="text" placeholder="Search prompts…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg" />
              </form>
              <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setPage(1); }} className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg">
                <option value="">All Types</option>
                <option value="prompt">Prompts</option>
                <option value="skill">Skills</option>
                <option value="workflow">Workflows</option>
              </select>
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} className="w-full px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg">
                <option value="">All Categories</option>
                {categories.filter(c => !c.parent_id).map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Loading */}
          {showLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse"><div className="h-52 bg-gray-200 rounded-xl"></div></div>
              ))}
            </div>
          )}

          {/* Empty */}
          {showEmpty && (
            <div className="text-center py-16">
              <p className="text-[var(--muted)] text-lg mb-2">No prompts found.</p>
              <p className="text-sm text-[var(--muted)] mb-4">Try a different search term or clear your filters.</p>
              <button onClick={clearFilters} className="text-sm text-[var(--accent)] hover:underline">Clear all filters</button>
            </div>
          )}

          {/* Error */}
          {showError && (
            <div className="text-center py-16">
              <p className="text-[var(--danger)] text-lg mb-2">Something went wrong.</p>
              <p className="text-sm text-[var(--muted)] mb-4">Failed to load prompts.</p>
              <button onClick={() => loadPrompts()} className="text-sm text-[var(--accent)] hover:underline">Try again</button>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {prompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-10">
              {page > 1 ? (
                <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm text-[var(--accent)] hover:underline rounded">← Previous</button>
              ) : (
                <span className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed">← Previous</span>
              )}
              {(() => {
                const pages: (number | '...')[] = [];
                const maxVisible = 7;
                if (totalPages <= maxVisible) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push('...');
                  const start = Math.max(2, page - 1);
                  const end = Math.min(totalPages - 1, page + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (page < totalPages - 2) pages.push('...');
                  pages.push(totalPages);
                }
                return pages.map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="px-3 py-2 text-sm text-gray-400">…</span>
                  ) : p === page ? (
                    <span key={p} className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded">{p}</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)} className="px-4 py-2 text-sm text-[var(--accent)] hover:underline rounded">{p}</button>
                  )
                );
              })()}
              {page < totalPages ? (
                <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm text-[var(--accent)] hover:underline rounded">Next →</button>
              ) : (
                <span className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed">Next →</span>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-[1440px] mx-auto px-4 py-8">Loading…</div>}>
      <BrowsePageContent />
    </Suspense>
  );
}
