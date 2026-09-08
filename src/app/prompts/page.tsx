import { supabase } from '@/lib/supabase';
import { Prompt } from '@/lib/types';
import PromptCard from '@/components/PromptCard';
import SearchBar from '@/components/SearchBar';

export const revalidate = 60;

async function getPrompts(searchParams: URLSearchParams): Promise<{ prompts: Prompt[]; total: number }> {
  const type = searchParams.get('type') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const q = searchParams.get('q') || undefined;
  const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  if (type && ['prompt', 'skill', 'workflow'].includes(type)) {
    query = query.eq('type', type);
  }

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  if (q) {
    const term = q.trim().replace(/[^\w\s]/g, '');
    query = query.textSearch('search_vector', term, { type: 'websearch' });
  }

  if (sort === 'popular') {
    query = query.order('likes_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching prompts:', error);
    return { prompts: [], total: 0 };
  }

  return { prompts: data || [], total: count || 0 };
}

export default async function BrowsePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (typeof v === 'string') sp.set(k, v);
  });

  const { prompts, total } = await getPrompts(sp);
  const type = sp.get('type') || '';
  const tag = sp.get('tag') || '';
  const q = sp.get('q') || '';
  const sort = sp.get('sort') || 'latest';
  const page = parseInt(sp.get('page') || '1');
  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {type ? `${type.charAt(0).toUpperCase() + type.slice(1)}s` : tag ? `#${tag}` : 'All Prompts'}
        </h1>
        <SearchBar />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <a href="/prompts" className={`px-3 py-1 rounded-full text-sm ${!type && !tag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          All
        </a>
        <a href="/prompts?type=prompt" className={`px-3 py-1 rounded-full text-sm ${type === 'prompt' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Prompts
        </a>
        <a href="/prompts?type=skill" className={`px-3 py-1 rounded-full text-sm ${type === 'skill' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Skills
        </a>
        <a href="/prompts?type=workflow" className={`px-3 py-1 rounded-full text-sm ${type === 'workflow' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Workflows
        </a>
        <span className="border-l border-gray-300 mx-2" />
        <a href={`/prompts?sort=latest${type ? `&type=${type}` : ''}`} className={`px-3 py-1 rounded-full text-sm ${sort === 'latest' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Latest
        </a>
        <a href={`/prompts?sort=popular${type ? `&type=${type}` : ''}`} className={`px-3 py-1 rounded-full text-sm ${sort === 'popular' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Popular
        </a>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-500">
        {total} prompt{total !== 1 ? 's' : ''} found
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No prompts found.</p>
          <a href="/submit" className="text-blue-600 hover:underline mt-2 inline-block">
            Be the first to submit one!
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={`/prompts?page=${page - 1}${type ? `&type=${type}` : ''}${tag ? `&tag=${tag}` : ''}${q ? `&q=${q}` : ''}&sort=${sort}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Prev
            </a>
          )}
          <span className="px-4 py-2 text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/prompts?page=${page + 1}${type ? `&type=${type}` : ''}${tag ? `&tag=${tag}` : ''}${q ? `&q=${q}` : ''}&sort=${sort}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
