import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/categories';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PromptCard from '@/components/PromptCard';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!category) {
    return { title: 'Category Not Found — PromptVault' };
  }

  return {
    title: `${category.name} Prompts — PromptVault`,
    description: category.description || `Browse ${category.name} prompts on PromptVault.`,
    alternates: {
      canonical: `/categories/${slug}`,
    },
  };
}

async function getCategory(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function getCategoryPrompts(categoryId: string) {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      prompt_categories!inner(category_id)
    `)
    .eq('prompt_categories.category_id', categoryId)
    .eq('status', 'published')
    .order('likes_count', { ascending: false });

  if (error) {
    console.error('Error fetching category prompts:', error);
    return [];
  }

  return data || [];
}

async function getSubcategories(categoryId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', categoryId)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return data || [];
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const [prompts, subcategories] = await Promise.all([
    getCategoryPrompts(category.id),
    getSubcategories(category.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{category.icon || '📁'}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600">{prompts.length} prompts</p>
          </div>
        </div>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
      </div>

      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg transition-colors"
              >
                {sub.icon && <span>{sub.icon}</span>}
                {sub.name}
                <span className="text-gray-400 text-sm">({sub.count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No prompts in this category yet.</p>
          <Link
            href="/submit"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit a Prompt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
